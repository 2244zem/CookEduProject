package com.example.cookedu.ui.screens

import android.content.Intent
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.cookedu.utils.ImageUtils
import com.example.cookedu.R
import com.example.cookedu.ui.theme.Cyan100
import com.example.cookedu.ui.theme.Cyan50
import com.example.cookedu.ui.theme.Primary
import com.example.cookedu.ui.theme.PrimaryDark
import com.example.cookedu.ui.theme.PrimaryLight
import com.example.cookedu.ui.theme.SurfaceLight
import com.example.cookedu.ui.theme.TextSecondaryLight
import com.example.cookedu.models.Ingredient
import com.example.cookedu.ui.viewmodel.RecipeDetailUiState
import com.example.cookedu.ui.viewmodel.RecipeViewModel
import androidx.compose.animation.core.*
import androidx.compose.ui.graphics.graphicsLayer

@Composable
fun RecipeDetailScreen(
    recipeId: String, 
    viewModel: RecipeViewModel,
    onNavigateBack: () -> Unit,
    onAddIngredientsToShopping: (recipeId: Int, ingredients: List<Ingredient>) -> Unit = { _, _ -> }
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    var checkedIngredients by remember { mutableStateOf(setOf<String>()) }
    var isCookingMode by remember { mutableStateOf(false) }
    var currentStep by remember { mutableStateOf(0) }
    
    val uiState by viewModel.detailUiState.collectAsState()

    LaunchedEffect(recipeId) {
        recipeId.toIntOrNull()?.let {
            viewModel.loadRecipeDetail(it)
        }
    }

    val state = uiState
    
    if (state is RecipeDetailUiState.Loading) {
        Box(modifier = Modifier.fillMaxSize().background(SurfaceLight), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Primary)
        }
        return
    }

    if (state is RecipeDetailUiState.Error) {
        Box(modifier = Modifier.fillMaxSize().background(SurfaceLight), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(state.message, color = Color.Red, fontSize = 14.sp)
                Spacer(modifier = Modifier.height(16.dp))
                Button(onClick = { recipeId.toIntOrNull()?.let { viewModel.loadRecipeDetail(it, true) } }) {
                    Text("Coba Lagi")
                }
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedButton(onClick = onNavigateBack) {
                    Text("Kembali")
                }
            }
        }
        return
    }
    
    val recipe = (state as? RecipeDetailUiState.Success)?.recipe ?: return

    val recipeTitle = recipe.title
    val recipeImage = recipe.imageUrl
    val recipeDifficulty = recipe.difficulty ?: "Medium"
    val recipeTime = "${recipe.prepTime ?: recipe.cookingTime ?: 45}m"
    val recipeCalories = "${recipe.nutritionalInfo?.calories ?: "---"} Kcal"
    val recipeRating = "4.8"
    val recipeDesc = recipe.description ?: "Resep lezat untuk Anda"
    val categoryName = recipe.category?.name ?: "MASAKAN"
    
    // Ingredients map correctly using our Ingredient model
    val ingredients = recipe.ingredients?.map { 
        "${it.amount ?: ""} ${it.unit ?: ""} ${it.item}".trim() 
    } ?: emptyList()

    val instructions = recipe.steps ?: emptyList()
    val ingredientModels: List<Ingredient> = recipe.ingredients ?: emptyList()

    if (isCookingMode) {
        val totalSteps = instructions.size
        val safeStep = if (totalSteps > 0) currentStep.coerceIn(0, totalSteps - 1) else 0
        val cookingProgress by animateFloatAsState(
            targetValue = if (totalSteps > 0) (safeStep + 1).toFloat() / totalSteps.toFloat() else 0f,
            animationSpec = spring(dampingRatio = 0.86f, stiffness = 180f),
            label = "CookingModeProgress"
        )
        val stepScrollState = rememberScrollState()
        val normalizedRecipeUrl = ImageUtils.getNormalizedImageUrl(context, recipeImage)

        LaunchedEffect(totalSteps) {
            if (totalSteps == 0 || currentStep !in 0 until totalSteps) {
                currentStep = 0
            }
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        listOf(Color(0xFFE0F2FE), Color(0xFFEFF6FF), Color.White)
                    )
                )
        ) {
            Box(
                modifier = Modifier
                    .offset(x = 245.dp, y = (-42).dp)
                    .size(150.dp)
                    .clip(RoundedCornerShape(48.dp))
                    .background(PrimaryLight.copy(alpha = 0.24f))
            )
            Box(
                modifier = Modifier
                    .offset(x = (-34).dp, y = 330.dp)
                    .size(94.dp)
                    .clip(RoundedCornerShape(32.dp))
                    .background(Color(0xFFFDE68A).copy(alpha = 0.72f))
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .statusBarsPadding()
                    .padding(horizontal = 20.dp, vertical = 14.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(26.dp))
                        .background(Color.White.copy(alpha = 0.86f))
                        .border(1.dp, Color.White, RoundedCornerShape(26.dp))
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                        Box(
                            modifier = Modifier
                                .size(58.dp)
                                .clip(RoundedCornerShape(20.dp))
                                .background(Cyan100),
                            contentAlignment = Alignment.Center
                        ) {
                            if (!normalizedRecipeUrl.isNullOrBlank()) {
                                AsyncImage(
                                    model = normalizedRecipeUrl,
                                    contentDescription = null,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            } else {
                                Icon(Icons.Default.Restaurant, contentDescription = null, tint = Primary, modifier = Modifier.size(28.dp))
                            }
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Mode Memasak", color = PrimaryDark, fontWeight = FontWeight.Black, fontSize = 13.sp)
                            Text(
                                recipeTitle,
                                color = Color(0xFF0F172A),
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                    IconButton(
                        onClick = { isCookingMode = false },
                        modifier = Modifier
                            .size(44.dp)
                            .background(Cyan50, RoundedCornerShape(16.dp))
                    ) {
                        Icon(Icons.Default.Close, contentDescription = null, tint = PrimaryDark)
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(28.dp))
                        .background(Brush.linearGradient(listOf(PrimaryLight, Primary, PrimaryDark)))
                        .border(1.dp, Color.White.copy(alpha = 0.5f), RoundedCornerShape(28.dp))
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            if (totalSteps > 0) "Langkah ${safeStep + 1} dari $totalSteps" else "Belum ada langkah",
                            color = Color.White,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            "Ikuti satu langkah, lalu lanjutkan dengan ritme tenang.",
                            color = Color.White.copy(alpha = 0.76f),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            lineHeight = 17.sp
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(58.dp)
                            .clip(RoundedCornerShape(20.dp))
                            .background(Color.White),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            if (totalSteps > 0) "${safeStep + 1}" else "-",
                            color = PrimaryDark,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                LinearProgressIndicator(
                    progress = { cookingProgress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(10.dp)
                        .clip(RoundedCornerShape(99.dp)),
                    color = Primary,
                    trackColor = Cyan100
                )

                Spacer(modifier = Modifier.height(18.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .clip(RoundedCornerShape(34.dp))
                        .background(Color.White.copy(alpha = 0.96f))
                        .border(1.dp, Cyan100, RoundedCornerShape(34.dp))
                        .padding(22.dp)
                ) {
                    if (instructions.isNotEmpty()) {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .verticalScroll(stepScrollState),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(86.dp)
                                    .clip(RoundedCornerShape(30.dp))
                                    .background(Cyan50),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.RestaurantMenu, contentDescription = null, tint = Primary, modifier = Modifier.size(42.dp))
                            }
                            Spacer(modifier = Modifier.height(24.dp))
                            val expandedStep = remember(instructions[safeStep]) {
                                buildReadableCookingStep(instructions[safeStep], safeStep)
                            }
                            Text(
                                expandedStep.title,
                                color = Color(0xFF0F172A),
                                fontSize = 25.sp,
                                fontWeight = FontWeight.Black,
                                lineHeight = 32.sp,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            Text(
                                expandedStep.guidance,
                                color = Color(0xFF475569),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                lineHeight = 21.sp,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(20.dp))
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(18.dp))
                                    .background(Cyan50)
                                    .padding(horizontal = 14.dp, vertical = 10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Primary, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    "${checkedIngredients.size}/${ingredients.size} bahan ditandai",
                                    color = Color(0xFF334155),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    } else {
                        Column(
                            modifier = Modifier.fillMaxSize(),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(Icons.Default.MenuBook, contentDescription = null, tint = Primary, modifier = Modifier.size(56.dp))
                            Spacer(modifier = Modifier.height(14.dp))
                            Text("Instruksi belum tersedia", color = Color(0xFF0F172A), fontSize = 20.sp, fontWeight = FontWeight.Black)
                            Text("Kembali ke detail resep untuk membaca bahan dan catatan.", color = TextSecondaryLight, fontSize = 13.sp, textAlign = TextAlign.Center)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (totalSteps > 0) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        repeat(totalSteps.coerceAtMost(8)) { index ->
                            val selected = index == safeStep.coerceAtMost(7)
                            Box(
                                modifier = Modifier
                                    .padding(horizontal = 3.dp)
                                    .width(if (selected) 24.dp else 8.dp)
                                    .height(8.dp)
                                    .clip(RoundedCornerShape(99.dp))
                                    .background(if (selected) Primary else Cyan100)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(
                        onClick = { if (currentStep > 0) currentStep-- },
                        enabled = totalSteps > 0 && currentStep > 0,
                        modifier = Modifier
                            .weight(1f)
                            .height(58.dp),
                        shape = RoundedCornerShape(20.dp),
                        border = BorderStroke(1.5.dp, Cyan100),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = Color.White,
                            contentColor = PrimaryDark,
                            disabledContainerColor = Color.White.copy(alpha = 0.62f),
                            disabledContentColor = TextSecondaryLight.copy(alpha = 0.55f)
                        )
                    ) {
                        Icon(Icons.Default.ChevronLeft, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Sebelumnya", fontWeight = FontWeight.Black, fontSize = 13.sp)
                    }

                    Button(
                        onClick = {
                            if (currentStep < totalSteps - 1) {
                                currentStep++
                            } else {
                                isCookingMode = false
                                currentStep = 0
                            }
                        },
                        enabled = totalSteps > 0,
                        modifier = Modifier
                            .weight(1f)
                            .height(58.dp),
                        shape = RoundedCornerShape(20.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Primary,
                            contentColor = Color.White,
                            disabledContainerColor = Primary.copy(alpha = 0.36f)
                        )
                    ) {
                        Text(
                            if (currentStep == totalSteps - 1) "Selesai" else "Lanjut",
                            fontWeight = FontWeight.Black,
                            fontSize = 13.sp
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            if (currentStep == totalSteps - 1) Icons.Default.Check else Icons.Default.ChevronRight,
                            contentDescription = null
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.White.copy(alpha = 0.84f))
                        .border(1.dp, Color.White, RoundedCornerShape(20.dp))
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.TipsAndUpdates, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        "Tips: cek bahan yang sudah siap di detail resep sebelum mulai.",
                        color = Color(0xFF334155),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        lineHeight = 17.sp
                    )
                }
            }
        }
        return
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Cyan100, Cyan50, Color.White)))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .verticalScroll(scrollState)
                .padding(horizontal = 20.dp, vertical = 16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onNavigateBack,
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(19.dp))
                        .background(Color.White.copy(alpha = 0.9f))
                        .border(1.dp, Color.White, RoundedCornerShape(19.dp))
                ) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = PrimaryDark)
                }
                AnimatedFavoriteButton(
                    isFavorite = recipe.isFavorite,
                    onClick = { viewModel.toggleFavorite(recipe) }
                )
            }

            Spacer(modifier = Modifier.height(18.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(268.dp)
                    .clip(RoundedCornerShape(42.dp))
                    .background(Color.White.copy(alpha = 0.55f))
                    .border(1.dp, Color.White, RoundedCornerShape(42.dp))
                    .padding(8.dp)
            ) {
                val normalizedUrl = ImageUtils.getNormalizedImageUrl(context, recipeImage)
                if (!normalizedUrl.isNullOrEmpty()) {
                    AsyncImage(
                        model = normalizedUrl,
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(RoundedCornerShape(34.dp))
                    )
                } else {
                    Image(
                        painter = painterResource(id = R.drawable.img_inspiration2),
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(RoundedCornerShape(34.dp))
                    )
                }
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(34.dp))
                        .background(
                            Brush.verticalGradient(
                                listOf(Color.Transparent, Color(0xFF0F172A).copy(alpha = 0.52f))
                            )
                        )
                )
                Text(
                    categoryName.uppercase(),
                    color = PrimaryDark,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(16.dp)
                        .clip(RoundedCornerShape(99.dp))
                        .background(Color.White.copy(alpha = 0.88f))
                        .padding(horizontal = 12.dp, vertical = 7.dp)
                )
                Text(
                    recipeTitle,
                    color = Color.White,
                    fontSize = 27.sp,
                    fontWeight = FontWeight.Black,
                    lineHeight = 32.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(18.dp)
                )
            }

            Spacer(modifier = Modifier.height(18.dp))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(38.dp))
                    .background(Color.White.copy(alpha = 0.88f))
                    .border(1.dp, Color.White, RoundedCornerShape(38.dp))
                    .padding(20.dp)
            ) {
            // Metrics Grid
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 20.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                MetricItem(Icons.Default.AccessTime, "Waktu", recipeTime, PrimaryDark, Cyan100)
                MetricItem(Icons.Default.LocalFireDepartment, "Kalori", recipeCalories, Color(0xFFE11D48), Color(0xFFFFE4E6))
                MetricItem(Icons.Default.EmojiEvents, "Level", recipeDifficulty, Color(0xFF946200), Color(0xFFFEF3C7))
                MetricItem(Icons.Default.Star, "Rating", recipeRating, Color(0xFFEAB308), Color(0xFFFEF9C3))
            }

            Text(
                recipeDesc,
                color = Color(0xFF475569),
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                lineHeight = 21.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp)
            )

            var detailClicked by remember { mutableStateOf(false) }
            val detailScale by animateFloatAsState(
                targetValue = if (detailClicked) 1.15f else 1.0f,
                animationSpec = spring(
                    dampingRatio = Spring.DampingRatioMediumBouncy,
                    stiffness = Spring.StiffnessLow
                ),
                finishedListener = { if (detailClicked) detailClicked = false },
                label = "DetailFavoriteScale"
            )

            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = {
                        detailClicked = true
                        viewModel.toggleFavorite(recipe)
                    },
                    modifier = Modifier
                        .weight(1f)
                        .graphicsLayer(scaleX = detailScale, scaleY = detailScale),
                    shape = RoundedCornerShape(22.dp),
                    border = BorderStroke(
                        width = 1.5.dp,
                        color = if (recipe.isFavorite) Color(0xFFFECDD3) else Primary
                    ),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = if (recipe.isFavorite) Color(0xFFFFF1F2) else Color.Transparent,
                        contentColor = if (recipe.isFavorite) Color(0xFFF43F5E) else Primary
                    )
                ) {
                    Icon(
                        imageVector = if (recipe.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(if (recipe.isFavorite) "Tersimpan" else "Simpan", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                OutlinedButton(
                    onClick = {
                        val shareText = buildString {
                            append("Coba resep: $recipeTitle\n")
                            append("Kategori: $categoryName\n")
                            append("Waktu: $recipeTime\n")
                            append("Kalori: $recipeCalories\n\n")
                            append("Buka di aplikasi CookEdu:\n")
                            append("cookedu://recipe/${recipe.id}\n\n")
                            append("Bahan utama:\n")
                            ingredientModels.take(5).forEach {
                                append("- ${it.amount ?: ""} ${it.unit ?: ""} ${it.item}".trim())
                                append("\n")
                            }
                        }
                        val shareIntent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_SUBJECT, "Resep CookEdu: $recipeTitle")
                            putExtra(Intent.EXTRA_TEXT, shareText)
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "Bagikan resep via"))
                    },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(22.dp)
                ) {
                    Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Bagikan", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }

            // Ingredients
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 16.dp)) {
                Box(modifier = Modifier.size(44.dp).background(Cyan100, RoundedCornerShape(18.dp)), contentAlignment = Alignment.Center) {
                    Icon(Icons.AutoMirrored.Filled.List, contentDescription = null, tint = Color.White)
                }
                Spacer(modifier = Modifier.width(16.dp))
                Text("Daftar Bahan", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Color(0xFF1E293B))
            }
            
            Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.padding(bottom = 32.dp)) {
                ingredients.forEach { ing ->
                    val isChecked = checkedIngredients.contains(ing)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(if (isChecked) Cyan50 else Color.White, RoundedCornerShape(24.dp))
                            .border(1.dp, if (isChecked) Primary.copy(alpha = 0.26f) else Cyan100.copy(alpha = 0.65f), RoundedCornerShape(24.dp))
                            .clickable { 
                                checkedIngredients = if (isChecked) checkedIngredients - ing else checkedIngredients + ing 
                            }
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .border(2.dp, if (isChecked) Primary else Cyan100, RoundedCornerShape(10.dp))
                                .background(if (isChecked) Primary else Color.Transparent, RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isChecked) Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Text(
                            ing,
                            color = if (isChecked) Color.Gray else Color(0xFF1E293B),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            textDecoration = if (isChecked) androidx.compose.ui.text.style.TextDecoration.LineThrough else null
                        )
                    }
                }
            }

            // Instructions
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(bottom = 16.dp)) {
                Box(modifier = Modifier.size(44.dp).background(Cyan100, RoundedCornerShape(18.dp)), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Restaurant, contentDescription = null, tint = PrimaryDark)
                }
                Spacer(modifier = Modifier.width(16.dp))
                Text("Cara Pembuatan", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Color(0xFF1E293B))
            }

            Column(verticalArrangement = Arrangement.spacedBy(24.dp), modifier = Modifier.padding(bottom = 40.dp)) {
                instructions.forEachIndexed { index, step ->
                    Row {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .border(2.dp, Primary, RoundedCornerShape(12.dp))
                            .background(Cyan50, RoundedCornerShape(16.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("${index + 1}", color = Primary, fontWeight = FontWeight.Black)
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .background(Cyan50, RoundedCornerShape(28.dp))
                                .border(1.dp, Color.White, RoundedCornerShape(28.dp))
                                .padding(16.dp)
                        ) {
                            val expanded = remember(step) { buildReadableCookingStep(step, index) }
                            Column {
                                Text(expanded.title, color = Color(0xFF0F172A), fontSize = 15.sp, fontWeight = FontWeight.Black, lineHeight = 21.sp)
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(expanded.guidance, color = Color(0xFF475569), fontSize = 13.sp, fontWeight = FontWeight.Medium, lineHeight = 20.sp)
                            }
                        }
                    }
                }
            }

            // CTAs
            Button(
                onClick = {
                    recipeId.toIntOrNull()?.let { id ->
                        if (ingredientModels.isNotEmpty()) {
                            onAddIngredientsToShopping(id, ingredientModels)
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(64.dp),
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Primary)
            ) {
                Icon(Icons.Default.ShoppingCart, contentDescription = null, tint = Color.White)
                Spacer(modifier = Modifier.width(12.dp))
                Text("Tambah ke daftar belanja", fontWeight = FontWeight.Black, fontSize = 14.sp)
            }
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedButton(
                onClick = { isCookingMode = true },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(24.dp),
                border = androidx.compose.foundation.BorderStroke(2.dp, Primary),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Primary)
            ) {
                Icon(Icons.Default.Restaurant, contentDescription = null)
                Spacer(modifier = Modifier.width(12.dp))
                Text("Mulai mode memasak", fontWeight = FontWeight.Black, fontSize = 13.sp)
            }
            Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

@Composable
fun MetricItem(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, value: String, tint: Color, bg: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(modifier = Modifier.size(50.dp).background(bg, RoundedCornerShape(20.dp)), contentAlignment = Alignment.Center) {
            Icon(icon, contentDescription = null, tint = tint)
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(label, color = Color.Gray, fontSize = 10.sp, fontWeight = FontWeight.Black)
        Text(value, color = Color(0xFF1E293B), fontSize = 12.sp, fontWeight = FontWeight.Black)
    }
}

private data class ReadableCookingStep(
    val title: String,
    val guidance: String
)

private fun buildReadableCookingStep(rawStep: String, index: Int): ReadableCookingStep {
    val clean = rawStep
        .replace(Regex("\\s+"), " ")
        .trim()
        .ifBlank { "Ikuti langkah memasak berikutnya." }
    val lower = clean.lowercase()

    val guidance = when {
        lower.contains("siapkan") || lower.contains("cuci") || lower.contains("potong") ->
            "Pastikan semua bahan sudah dicuci, ditiriskan, dan dipotong seragam. Ukuran yang konsisten membuat bahan matang merata dan proses memasak tidak terasa terburu-buru."
        lower.contains("halus") || lower.contains("ulek") || lower.contains("blender") ->
            "Haluskan bumbu sampai teksturnya menyatu. Jika memakai blender, tambahkan sedikit minyak atau air seperlunya agar mesin bergerak tanpa membuat bumbu terlalu encer."
        lower.contains("tumis") ->
            "Panaskan wajan lebih dulu, lalu tumis bumbu dengan api sedang. Aduk perlahan sampai aromanya keluar, warnanya lebih pekat, dan minyak mulai terlihat di pinggir bumbu."
        lower.contains("rebus") || lower.contains("didih") ->
            "Gunakan api sedang sampai cairan mendidih stabil. Setelah itu kecilkan api agar bahan matang pelan, rasa keluar, dan tekstur tidak mudah hancur."
        lower.contains("masukkan") || lower.contains("tambahkan") ->
            "Masukkan bahan secara bertahap. Mulai dari bahan yang paling lama matang, lalu lanjutkan bahan yang lebih cepat matang supaya hasil akhirnya tetap rapi."
        lower.contains("aduk") ->
            "Aduk dari dasar wajan atau panci agar bumbu tidak menempel. Gerakannya cukup pelan dan konsisten, tidak perlu terlalu kuat."
        lower.contains("masak") || lower.contains("matang") ->
            "Masak sampai tekstur bahan sesuai: empuk, tidak langu, dan bumbu menempel. Cicipi sedikit sebelum lanjut agar garam, manis, dan gurihnya seimbang."
        lower.contains("sajikan") || lower.contains("hidangkan") ->
            "Matikan api, diamkan sebentar agar panasnya turun, lalu sajikan. Tambahkan garnish atau pelengkap jika ada supaya tampilan lebih mengundang."
        else ->
            "Kerjakan langkah ini dengan api dan waktu yang terkendali. Perhatikan aroma, warna, dan tekstur; tiga tanda itu lebih berguna daripada hanya mengikuti menit secara kaku."
    }

    val title = if (clean.length < 42) {
        "Langkah ${index + 1}: $clean"
    } else {
        clean
    }

    return ReadableCookingStep(title = title, guidance = guidance)
}
