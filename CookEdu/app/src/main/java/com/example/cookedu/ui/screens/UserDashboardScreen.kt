package com.example.cookedu.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExtendedFloatingActionButton
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.cookedu.models.Recipe
import com.example.cookedu.ui.components.CookEduActionTile
import com.example.cookedu.ui.components.CookEduCard
import com.example.cookedu.ui.components.CookEduEmptyState
import com.example.cookedu.ui.components.CookEduShimmerBox
import com.example.cookedu.ui.components.CookEduTopBar
import com.example.cookedu.ui.components.PressableScale
import com.example.cookedu.ui.theme.Cyan100
import com.example.cookedu.ui.theme.Cyan50
import com.example.cookedu.ui.theme.Primary
import com.example.cookedu.ui.theme.PrimaryDark
import com.example.cookedu.ui.theme.PrimaryLight
import com.example.cookedu.ui.theme.SurfaceLight
import com.example.cookedu.ui.theme.TextSecondaryLight
import com.example.cookedu.ui.viewmodel.DashboardUiState
import com.example.cookedu.ui.viewmodel.DashboardViewModel
import com.example.cookedu.utils.ImageUtils

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserDashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToLogin: () -> Unit,
    onNavigateToAi: () -> Unit = {},
    onNavigateToRecipe: (String) -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("Semua") }
    val context = LocalContext.current

    val categories = when (val state = uiState) {
        is DashboardUiState.Success -> {
            val fromRecipes = state.highlightRecipes.mapNotNull { it.category?.name?.trim() }
            listOf("Semua") + fromRecipes.filter { it.isNotBlank() }.distinct()
        }
        else -> listOf("Semua")
    }

    LaunchedEffect(categories) {
        if (selectedCategory !in categories) selectedCategory = "Semua"
    }

    Scaffold(
        containerColor = Color.Transparent,
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = onNavigateToAi,
                containerColor = Primary,
                contentColor = Color.White,
                shape = RoundedCornerShape(22.dp),
                icon = { Icon(Icons.Default.SmartToy, contentDescription = null) },
                text = { Text("AI Chef", fontWeight = FontWeight.Black) }
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.verticalGradient(listOf(Cyan50, SurfaceLight, Color.White)))
                .padding(innerPadding),
            contentPadding = PaddingValues(bottom = 112.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            item {
                CookEduTopBar(
                    title = "CookEdu",
                    subtitle = "Resep, belajar, dan progres masakmu.",
                    actionIcon = Icons.Default.Refresh,
                    onAction = { viewModel.loadDashboardData() }
                )
            }

            when (val state = uiState) {
                is DashboardUiState.Loading -> {
                    item { DashboardLoadingState() }
                }

                is DashboardUiState.Error -> {
                    item {
                        CookEduEmptyState(
                            icon = Icons.Default.Restaurant,
                            title = "Dashboard belum termuat",
                            body = state.message,
                            modifier = Modifier.padding(horizontal = 20.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = { viewModel.loadDashboardData() },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 20.dp)
                                .height(52.dp),
                            shape = RoundedCornerShape(18.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Primary)
                        ) {
                            Text("Coba lagi", color = Color.White, fontWeight = FontWeight.Black)
                        }
                    }
                }

                is DashboardUiState.Success -> {
                    val user = state.user
                    val avatarUrl = ImageUtils.getNormalizedImageUrl(context, user?.avatarUrl)
                    val firstRecipe = state.highlightRecipes.firstOrNull()
                    val filteredRecipes = state.highlightRecipes.filter { recipe ->
                        val matchSearch = recipe.title.contains(searchQuery, ignoreCase = true)
                        val matchCategory = selectedCategory == "Semua" ||
                            recipe.category?.name.equals(selectedCategory, ignoreCase = true)
                        matchSearch && matchCategory
                    }

                    item {
                        DashboardHero(
                            name = user?.name ?: "Koki CookEdu",
                            xp = user?.xp ?: 0,
                            avatarUrl = avatarUrl,
                            onPrimaryAction = onNavigateToAi
                        )
                    }

                    if (!state.errorMessage.isNullOrBlank()) {
                        item {
                            CookEduCard(modifier = Modifier.padding(horizontal = 20.dp), radius = 20.dp) {
                                Text(
                                    "Mode data cadangan aktif",
                                    color = PrimaryDark,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 14.sp
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    state.errorMessage,
                                    color = TextSecondaryLight,
                                    fontSize = 12.sp,
                                    lineHeight = 18.sp
                                )
                            }
                        }
                    }

                    item {
                        DashboardSearch(
                            value = searchQuery,
                            onValueChange = { searchQuery = it }
                        )
                    }

                    item {
                        DashboardActions(
                            onAi = onNavigateToAi,
                            onRefresh = { viewModel.loadDashboardData() },
                            onFirstRecipe = {
                                firstRecipe?.let { onNavigateToRecipe(it.id.toString()) }
                            },
                            firstRecipeEnabled = firstRecipe != null
                        )
                    }

                    item {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(categories) { category ->
                                DashboardCategoryChip(
                                    label = category,
                                    selected = selectedCategory == category,
                                    onClick = { selectedCategory = category }
                                )
                            }
                        }
                    }

                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 20.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "Rekomendasi",
                                color = Color(0xFF0F172A),
                                fontSize = 19.sp,
                                fontWeight = FontWeight.Black
                            )
                            Text(
                                "${filteredRecipes.size} resep",
                                color = Primary,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black
                            )
                        }
                    }

                    if (filteredRecipes.isEmpty()) {
                        item {
                            CookEduEmptyState(
                                icon = Icons.Default.Search,
                                title = "Resep tidak ditemukan",
                                body = "Coba ganti kata kunci atau pilih kategori lain.",
                                modifier = Modifier.padding(horizontal = 20.dp)
                            )
                        }
                    } else {
                        items(filteredRecipes, key = { it.id }) { recipe ->
                            CompactRecipeCard(
                                recipe = recipe,
                                onClick = { onNavigateToRecipe(recipe.id.toString()) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DashboardHero(
    name: String,
    xp: Int,
    avatarUrl: String?,
    onPrimaryAction: () -> Unit
) {
    val progress = ((xp % 100).toFloat() / 100f).coerceIn(0.08f, 1f)
    val firstName = name.trim().split(" ").firstOrNull().orEmpty().ifBlank { "Koki" }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
            .clip(RoundedCornerShape(34.dp))
            .background(Brush.linearGradient(listOf(PrimaryLight, Primary, PrimaryDark)))
            .border(1.dp, Color.White.copy(alpha = 0.34f), RoundedCornerShape(34.dp))
            .padding(20.dp)
    ) {
        Box(
            modifier = Modifier
                .offset(x = 205.dp, y = (-38).dp)
                .size(132.dp)
                .clip(RoundedCornerShape(42.dp))
                .background(Color.White.copy(alpha = 0.14f))
        )
        Box(
            modifier = Modifier
                .offset(x = (-36).dp, y = 152.dp)
                .size(82.dp)
                .clip(RoundedCornerShape(28.dp))
                .background(Color(0xFFFDE68A).copy(alpha = 0.78f))
        )

        Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(58.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.White)
                        .border(1.dp, Color.White, RoundedCornerShape(20.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    if (!avatarUrl.isNullOrBlank()) {
                        AsyncImage(
                            model = avatarUrl,
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    } else {
                        Icon(Icons.Default.Person, contentDescription = null, tint = Primary, modifier = Modifier.size(30.dp))
                    }
                }
                Spacer(modifier = Modifier.width(14.dp))
                Column {
                    Text("Halo, $firstName", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Black)
                    Text("Siap masak lebih rapi hari ini.", color = Color.White.copy(alpha = 0.78f), fontSize = 13.sp, fontWeight = FontWeight.Medium)
                }
            }

            Spacer(modifier = Modifier.height(28.dp))
            Text(
                "Belajar dari resep yang langsung bisa dipraktikkan.",
                color = Color.White,
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                lineHeight = 30.sp
            )
            Spacer(modifier = Modifier.height(16.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                DashboardHeroMetric(Icons.Default.TrendingUp, "$xp XP", "Progress")
                DashboardHeroMetric(Icons.AutoMirrored.Filled.MenuBook, "8+", "Modul")
            }

            Spacer(modifier = Modifier.height(18.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(9.dp)
                    .clip(RoundedCornerShape(99.dp))
                    .background(Color.White.copy(alpha = 0.22f))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .fillMaxWidth(progress)
                        .clip(RoundedCornerShape(99.dp))
                        .background(Color.White)
                )
            }

            Spacer(modifier = Modifier.height(18.dp))
            PressableScale(onClick = onPrimaryAction) {
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(18.dp))
                        .background(Color.White)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Tanya AI Chef", color = PrimaryDark, fontWeight = FontWeight.Black, fontSize = 13.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = PrimaryDark, modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}

@Composable
private fun DashboardHeroMetric(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    value: String,
    label: String
) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White.copy(alpha = 0.18f))
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Column {
            Text(value, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Black)
            Text(label, color = Color.White.copy(alpha = 0.74f), fontSize = 10.sp, fontWeight = FontWeight.Medium)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DashboardSearch(
    value: String,
    onValueChange: (String) -> Unit
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp),
        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Primary) },
        placeholder = { Text("Cari resep atau bahan", color = TextSecondaryLight) },
        singleLine = true,
        shape = RoundedCornerShape(22.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedContainerColor = Color.White,
            unfocusedContainerColor = Color.White,
            focusedBorderColor = PrimaryLight,
            unfocusedBorderColor = Cyan100,
            cursorColor = Primary
        )
    )
}

@Composable
private fun DashboardActions(
    onAi: () -> Unit,
    onRefresh: () -> Unit,
    onFirstRecipe: () -> Unit,
    firstRecipeEnabled: Boolean
) {
    Column(
        modifier = Modifier.padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            CookEduActionTile(
                icon = Icons.Default.SmartToy,
                title = "AI Chef",
                subtitle = "Tanya ide masak",
                modifier = Modifier.weight(1f),
                onClick = onAi
            )
            CookEduActionTile(
                icon = Icons.AutoMirrored.Filled.MenuBook,
                title = "Resep cepat",
                subtitle = if (firstRecipeEnabled) "Lanjut lihat detail" else "Belum tersedia",
                modifier = Modifier.weight(1f),
                onClick = onFirstRecipe
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            CookEduActionTile(
                icon = Icons.Default.AutoAwesome,
                title = "Inspirasi",
                subtitle = "Bahan jadi menu",
                modifier = Modifier.weight(1f),
                onClick = onAi
            )
            CookEduActionTile(
                icon = Icons.Default.Refresh,
                title = "Refresh",
                subtitle = "Ambil data baru",
                modifier = Modifier.weight(1f),
                onClick = onRefresh
            )
        }
    }
}

@Composable
private fun DashboardCategoryChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    PressableScale(onClick = onClick) {
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(18.dp))
                .background(if (selected) Primary else Color.White)
                .border(1.dp, if (selected) Primary else Cyan100, RoundedCornerShape(18.dp))
                .padding(horizontal = 16.dp, vertical = 10.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                label,
                color = if (selected) Color.White else Color(0xFF334155),
                fontSize = 13.sp,
                fontWeight = FontWeight.Black,
                maxLines = 1
            )
        }
    }
}

@Composable
private fun CompactRecipeCard(
    recipe: Recipe,
    onClick: () -> Unit
) {
    val context = LocalContext.current
    val normalizedUrl = ImageUtils.getNormalizedImageUrl(context, recipe.imageUrl)

    CookEduCard(
        modifier = Modifier.padding(horizontal = 20.dp),
        radius = 24.dp,
        onClick = onClick
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(92.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Cyan100),
                contentAlignment = Alignment.Center
            ) {
                if (!normalizedUrl.isNullOrBlank()) {
                    AsyncImage(
                        model = normalizedUrl,
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Icon(Icons.Default.Restaurant, contentDescription = null, tint = Primary, modifier = Modifier.size(34.dp))
                }
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    recipe.category?.name ?: "Resep",
                    color = Primary,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    recipe.title,
                    color = Color(0xFF0F172A),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Black,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 20.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    RecipeInfoPill(Icons.Default.AccessTime, "${recipe.cookingTime ?: recipe.prepTime ?: 20}m")
                    RecipeInfoPill(Icons.Default.Star, "4.8")
                }
            }

            Icon(Icons.Default.KeyboardArrowRight, contentDescription = null, tint = Primary, modifier = Modifier.size(24.dp))
        }
    }
}

@Composable
private fun RecipeInfoPill(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    text: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(99.dp))
            .background(Cyan50)
            .padding(horizontal = 9.dp, vertical = 6.dp)
    ) {
        Icon(icon, contentDescription = null, tint = Primary, modifier = Modifier.size(14.dp))
        Spacer(modifier = Modifier.width(4.dp))
        Text(text, color = Color(0xFF334155), fontSize = 11.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun DashboardLoadingState() {
    Column(
        modifier = Modifier.padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        CookEduShimmerBox(
            modifier = Modifier
                .fillMaxWidth()
                .height(250.dp),
            radius = 34.dp
        )
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            CookEduShimmerBox(
                modifier = Modifier
                    .weight(1f)
                    .height(118.dp),
                radius = 24.dp
            )
            CookEduShimmerBox(
                modifier = Modifier
                    .weight(1f)
                    .height(118.dp),
                radius = 24.dp
            )
        }
        repeat(3) {
            CookEduShimmerBox(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp),
                radius = 24.dp
            )
        }
    }
}
