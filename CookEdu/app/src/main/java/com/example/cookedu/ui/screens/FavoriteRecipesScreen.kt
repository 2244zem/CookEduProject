package com.example.cookedu.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.example.cookedu.ui.components.CookEduEmptyState
import com.example.cookedu.ui.components.CookEduTopBar
import com.example.cookedu.ui.theme.Cyan100
import com.example.cookedu.ui.theme.Cyan50
import com.example.cookedu.ui.theme.Primary
import com.example.cookedu.ui.viewmodel.FavoriteRecipesUiState
import com.example.cookedu.ui.viewmodel.RecipeViewModel

@Composable
fun FavoriteRecipesScreen(
    viewModel: RecipeViewModel,
    onNavigateToDetail: (String) -> Unit
) {
    val uiState by viewModel.favoriteUiState.collectAsState()
    val lifecycleOwner = LocalLifecycleOwner.current

    LaunchedEffect(Unit) {
        viewModel.loadFavoriteRecipes()
    }

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                viewModel.loadFavoriteRecipes()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Cyan100, Cyan50, Color.White)))
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            contentPadding = PaddingValues(bottom = 104.dp)
        ) {
            item {
                CookEduTopBar(
                    title = "Favorit",
                    subtitle = "Resep yang kamu simpan untuk dicoba lagi.",
                    actionIcon = Icons.Default.Refresh,
                    onAction = { viewModel.loadFavoriteRecipes() }
                )
            }

            when (val state = uiState) {
                is FavoriteRecipesUiState.Loading -> {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(top = 180.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(color = Primary)
                        }
                    }
                }
                is FavoriteRecipesUiState.Error -> {
                    item {
                        CookEduEmptyState(
                            icon = Icons.Default.Favorite,
                            title = "Favorit belum termuat",
                            body = state.message,
                            modifier = Modifier.padding(horizontal = 20.dp)
                        )
                    }
                }
                is FavoriteRecipesUiState.Success -> {
                    if (state.recipes.isEmpty()) {
                        item {
                            CookEduEmptyState(
                                icon = Icons.Default.Favorite,
                                title = "Belum ada resep favorit",
                                body = "Simpan resep yang menarik, nanti semuanya muncul di sini.",
                                modifier = Modifier.padding(horizontal = 20.dp)
                            )
                        }
                    } else {
                        items(state.recipes) { recipe ->
                            Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                                RecipeListItem(
                                    recipe = recipe,
                                    onClick = { onNavigateToDetail(recipe.id.toString()) },
                                    onToggleFavorite = { viewModel.toggleFavorite(recipe) }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
