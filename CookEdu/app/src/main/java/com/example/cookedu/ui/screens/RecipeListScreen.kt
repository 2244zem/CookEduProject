package com.example.cookedu.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import androidx.compose.ui.platform.LocalContext
import com.example.cookedu.utils.ImageUtils
import com.example.cookedu.R
import com.example.cookedu.models.Recipe
import com.example.cookedu.ui.theme.Cyan100
import com.example.cookedu.ui.theme.Cyan50
import com.example.cookedu.ui.theme.Primary
import com.example.cookedu.ui.theme.PrimaryDark
import com.example.cookedu.ui.theme.PrimaryLight
import com.example.cookedu.ui.theme.SurfaceLight
import com.example.cookedu.ui.theme.TextSecondaryLight
import com.example.cookedu.ui.viewmodel.RecipeListUiState
import com.example.cookedu.ui.viewmodel.RecipeViewModel
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.animation.core.*
import androidx.compose.ui.graphics.graphicsLayer

@Composable
fun RecipeListScreen(
    viewModel: RecipeViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToDetail: (String) -> Unit
) {
    val allCategoryLabel = "SEMUA"
    var activeCategory by remember { mutableStateOf(allCategoryLabel) }
    var searchQuery by remember { mutableStateOf("") }

    val uiState by viewModel.listUiState.collectAsState()
    val listState = rememberLazyListState()

    LaunchedEffect(Unit) {
        viewModel.loadRecipes()
    }

    val availableCategories = if (uiState is RecipeListUiState.Success) {
        val all = (uiState as RecipeListUiState.Success).recipes
        listOf(allCategoryLabel) + all.mapNotNull { it.category?.name?.trim() }
            .filter { it.isNotEmpty() }
            .distinct()
    } else {
        listOf(allCategoryLabel)
    }

    LaunchedEffect(availableCategories) {
        if (activeCategory != allCategoryLabel && !availableCategories.contains(activeCategory)) {
            activeCategory = allCategoryLabel
        }
    }

    // Client-side filtering for fast UX
    val filteredRecipes = if (uiState is RecipeListUiState.Success) {
        val all = (uiState as RecipeListUiState.Success).recipes
        all.filter {
            val matchesCategory = activeCategory == allCategoryLabel ||
                it.category?.name.equals(activeCategory, ignoreCase = true)
            val matchesSearch = it.title.contains(searchQuery, ignoreCase = true) ||
                (it.description?.contains(searchQuery, ignoreCase = true) == true)
            matchesCategory && matchesSearch
        }
    } else {
        emptyList()
    }

    val shouldLoadMore = remember(uiState, listState) {
        val state = uiState
        if (state !is RecipeListUiState.Success) return@remember false
        val lastVisible = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: -1
        state.hasMore && !state.isLoadingMore && lastVisible >= filteredRecipes.size - 3 && filteredRecipes.isNotEmpty()
    }

    LaunchedEffect(shouldLoadMore) {
        if (shouldLoadMore) {
            viewModel.loadMoreRecipes()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Cyan100, Cyan50, Color.White)))
    ) {
        Image(
            painter = painterResource(id = R.drawable.bg_food_drawing),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
            alpha = 0.08f
        )
        
        Column(modifier = Modifier.fillMaxSize()) {
            Spacer(modifier = Modifier.height(30.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(38.dp))
                    .background(Brush.linearGradient(listOf(Color.White.copy(alpha = 0.92f), Cyan50)))
                    .border(1.dp, Color.White, RoundedCornerShape(38.dp))
                    .padding(20.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(RoundedCornerShape(21.dp))
                            .background(Cyan100),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.RestaurantMenu, contentDescription = null, tint = PrimaryDark)
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text("Jelajah Resep", fontSize = 24.sp, fontWeight = FontWeight.Black, color = Color(0xFF0F172A))
                        Text("Cari menu yang masuk akal untuk dapur hari ini.", fontSize = 12.sp, color = TextSecondaryLight, fontWeight = FontWeight.SemiBold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Search Bar
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .background(Color.White.copy(alpha = 0.88f), RoundedCornerShape(34.dp))
                    .border(1.5.dp, Color.White.copy(alpha = 0.78f), RoundedCornerShape(34.dp))
                    .padding(horizontal = 18.dp, vertical = 14.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Search, contentDescription = null, tint = TextSecondaryLight, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Cari keajaiban rasa hari ini...", fontSize = 13.sp) },
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color.Transparent,
                            unfocusedBorderColor = Color.Transparent,
                            unfocusedTextColor = Color(0xFF0F172A),
                            focusedTextColor = Color(0xFF0F172A),
                            unfocusedPlaceholderColor = Color(0xFF94A3B8),
                            focusedPlaceholderColor = Color(0xFF94A3B8)
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Categories
            LazyRow(
                modifier = Modifier.padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(availableCategories.size) { index ->
                    val cat = availableCategories[index]
                    val isSelected = activeCategory == cat
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(99.dp))
                            .background(if (isSelected) Brush.linearGradient(listOf(Primary, PrimaryDark)) else SolidColor(Color.White.copy(alpha = 0.9f)))
                            .border(if (!isSelected) 1.dp else 0.dp, Cyan100, RoundedCornerShape(99.dp))
                            .clickable { activeCategory = cat }
                            .padding(horizontal = 18.dp, vertical = 10.dp)
                    ) {
                        Text(
                            cat, 
                            color = if (isSelected) Color.White else TextSecondaryLight, 
                            fontSize = 11.sp, 
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            when (val state = uiState) {
                is RecipeListUiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Primary)
                    }
                }
                is RecipeListUiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(state.message, color = Color.Red, fontSize = 14.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            Button(onClick = { viewModel.loadRecipes(forceRefresh = true) }) {
                                Text("Coba Lagi")
                            }
                        }
                    }
                }
                is RecipeListUiState.Success -> {
                    if (filteredRecipes.isEmpty()) {
                        Box(modifier = Modifier.fillMaxSize().padding(bottom = 80.dp), contentAlignment = Alignment.Center) {
                            Text("Tidak ada resep yang ditemukan.", color = Color.Gray)
                        }
                    } else {
                        LazyColumn(
                            state = listState,
                            modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                            contentPadding = PaddingValues(bottom = 80.dp) // Space for bottom nav
                        ) {
                            items(filteredRecipes.size) { index ->
                                val recipe = filteredRecipes[index]
                                RecipeListItem(
                                    recipe = recipe,
                                    onClick = { onNavigateToDetail(recipe.id.toString()) },
                                    onToggleFavorite = { viewModel.toggleFavorite(recipe) }
                                )
                            }
                            if (state.isLoadingMore) {
                                item {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 12.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        CircularProgressIndicator(
                                            color = Primary,
                                            modifier = Modifier.size(22.dp),
                                            strokeWidth = 2.dp
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun RecipeListItem(recipe: Recipe, onClick: () -> Unit, onToggleFavorite: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Brush.verticalGradient(listOf(Color.White.copy(alpha = 0.96f), Color(0xFFF7FCFF))), RoundedCornerShape(34.dp))
            .border(1.5.dp, Color.White.copy(alpha = 0.86f), RoundedCornerShape(34.dp))
            .clickable { onClick() }
            .padding(18.dp)
    ) {
        Row {
            // Image Box - Improved styling
            Box(
                modifier = Modifier
                    .size(104.dp)
                    .clip(RoundedCornerShape(30.dp))
                    .background(Cyan100),
                contentAlignment = Alignment.Center
            ) {
                val normalizedUrl = ImageUtils.getNormalizedImageUrl(LocalContext.current, recipe.imageUrl)
                if (!normalizedUrl.isNullOrEmpty()) {
                    AsyncImage(
                        model = normalizedUrl,
                        contentDescription = null,
                        placeholder = painterResource(id = R.drawable.img_inspiration1),
                        error = painterResource(id = R.drawable.img_inspiration1),
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Icon(Icons.Default.Restaurant, contentDescription = null, tint = Primary, modifier = Modifier.size(36.dp))
                }
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Details - Improved typography
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.SpaceBetween) {
                Text(recipe.category?.name?.uppercase() ?: "RESEP", fontSize = 10.sp, color = PrimaryDark, fontWeight = FontWeight.Black)
                Text(recipe.title, fontSize = 17.sp, fontWeight = FontWeight.Black, color = Color(0xFF0F172A), maxLines = 2, lineHeight = 22.sp)
                val ingredientPreview = recipe.ingredients?.take(2)?.joinToString(", ") { it.item }.orEmpty()
                if (ingredientPreview.isNotBlank()) {
                    Text(
                        "Bahan: $ingredientPreview",
                        fontSize = 11.sp,
                        color = TextSecondaryLight,
                        maxLines = 1
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.AccessTime, contentDescription = null, modifier = Modifier.size(14.dp), tint = TextSecondaryLight)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("${recipe.prepTime ?: recipe.cookingTime ?: 20}m", fontSize = 10.sp, color = Color(0xFF475569), fontWeight = FontWeight.Bold)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.LocalFireDepartment, contentDescription = null, modifier = Modifier.size(12.dp), tint = Color(0xFFF43F5E))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(recipe.difficulty ?: "Easy", fontSize = 10.sp, color = Color(0xFF475569), fontWeight = FontWeight.Bold)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.MonitorHeart, contentDescription = null, modifier = Modifier.size(12.dp), tint = Color(0xFF16A34A))
                        Spacer(modifier = Modifier.width(4.dp))
                        val kcal = recipe.nutritionalInfo?.calories ?: 0
                        Text("${kcal}kkal", fontSize = 10.sp, color = Color(0xFF475569), fontWeight = FontWeight.Bold)
                    }
                }
            }
            
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                AnimatedFavoriteButton(
                    isFavorite = recipe.isFavorite,
                    onClick = onToggleFavorite
                )
                Spacer(modifier = Modifier.height(12.dp))
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .background(Cyan50, RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Primary)
                }
            }
        }
    }
}

@Composable
fun AnimatedFavoriteButton(
    isFavorite: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var clicked by remember { mutableStateOf(false) }
    
    // Smooth pop/bounce animation using Spring
    val scale by animateFloatAsState(
        targetValue = if (clicked) 1.25f else 1.0f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        finishedListener = {
            if (clicked) {
                clicked = false
            }
        },
        label = "FavoriteScale"
    )

    IconButton(
        onClick = {
            clicked = true
            onClick()
        },
        modifier = modifier
            .size(36.dp)
            .graphicsLayer(
                scaleX = scale,
                scaleY = scale
            )
            .background(
                color = if (isFavorite) Color(0xFFFFF1F2) else Color(0xFFF8FAFC),
                shape = RoundedCornerShape(12.dp)
            )
            .border(
                width = 1.dp,
                color = if (isFavorite) Color(0xFFFECDD3) else Color(0xFFE2E8F0),
                shape = RoundedCornerShape(12.dp)
            )
    ) {
        Icon(
            imageVector = if (isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
            contentDescription = "Simpan Resep",
            tint = if (isFavorite) Color(0xFFF43F5E) else Color(0xFF94A3B8),
            modifier = Modifier.size(18.dp)
        )
    }
}
