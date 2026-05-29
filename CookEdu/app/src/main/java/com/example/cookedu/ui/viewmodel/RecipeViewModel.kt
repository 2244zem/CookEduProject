package com.example.cookedu.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cookedu.data.repository.RecipeRepository
import com.example.cookedu.models.Recipe
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch

sealed class RecipeListUiState {
    object Loading : RecipeListUiState()
    data class Success(
        val recipes: List<Recipe>,
        val isOffline: Boolean = false,
        val currentPage: Int = 1,
        val hasMore: Boolean = false,
        val isLoadingMore: Boolean = false
    ) : RecipeListUiState()
    data class Error(val message: String) : RecipeListUiState()
}

sealed class RecipeDetailUiState {
    object Loading : RecipeDetailUiState()
    data class Success(val recipe: Recipe) : RecipeDetailUiState()
    data class Error(val message: String) : RecipeDetailUiState()
}

sealed class FavoriteRecipesUiState {
    object Loading : FavoriteRecipesUiState()
    data class Success(val recipes: List<Recipe>) : FavoriteRecipesUiState()
    data class Error(val message: String) : FavoriteRecipesUiState()
}

class RecipeViewModel(private val repository: RecipeRepository) : ViewModel() {

    private val _listUiState = MutableStateFlow<RecipeListUiState>(RecipeListUiState.Loading)
    val listUiState: StateFlow<RecipeListUiState> = _listUiState

    private val _detailUiState = MutableStateFlow<RecipeDetailUiState>(RecipeDetailUiState.Loading)
    val detailUiState: StateFlow<RecipeDetailUiState> = _detailUiState
    private val _favoriteUiState = MutableStateFlow<FavoriteRecipesUiState>(FavoriteRecipesUiState.Loading)
    val favoriteUiState: StateFlow<FavoriteRecipesUiState> = _favoriteUiState
    private var currentCategoryId: Int? = null
    private var currentSearch: String? = null

    fun loadRecipes(categoryId: Int? = null, search: String? = null, forceRefresh: Boolean = false) {
        viewModelScope.launch {
            currentCategoryId = categoryId
            currentSearch = search
            _listUiState.value = RecipeListUiState.Loading
            val result = repository.getRecipesPage(
                page = 1,
                categoryId = categoryId,
                search = search,
                perPage = 20
            )
            result.onSuccess { page ->
                _listUiState.value = RecipeListUiState.Success(
                    recipes = page.recipes,
                    currentPage = page.currentPage,
                    hasMore = page.currentPage < page.lastPage
                )
            }.onFailure { error ->
                if (!forceRefresh) {
                    repository.getRecipes(categoryId, search, forceRefresh = false)
                        .catch { e ->
                            _listUiState.value = RecipeListUiState.Error(e.message ?: "Failed to load recipes")
                        }
                        .collect { fallback ->
                            fallback.onSuccess { recipes ->
                                _listUiState.value = RecipeListUiState.Success(
                                    recipes = recipes,
                                    currentPage = 1,
                                    hasMore = false
                                )
                            }.onFailure {
                                _listUiState.value =
                                    RecipeListUiState.Error(error.message ?: "Failed to load recipes")
                            }
                        }
                } else {
                    _listUiState.value = RecipeListUiState.Error(error.message ?: "Failed to load recipes")
                }
            }
        }
    }

    fun loadRecipeDetail(id: Int, forceRefresh: Boolean = false) {
        viewModelScope.launch {
            _detailUiState.value = RecipeDetailUiState.Loading
            repository.getRecipeDetail(id, forceRefresh)
                .catch { e ->
                    if (_detailUiState.value !is RecipeDetailUiState.Success) {
                        _detailUiState.value = RecipeDetailUiState.Error(e.message ?: "Failed to load recipe detail")
                    }
                }
                .collect { result ->
                    result.onSuccess { recipe ->
                        _detailUiState.value = RecipeDetailUiState.Success(recipe)
                    }.onFailure { error ->
                        if (_detailUiState.value !is RecipeDetailUiState.Success) {
                            _detailUiState.value = RecipeDetailUiState.Error(error.message ?: "Failed to load recipe detail")
                        }
                    }
                }
        }
    }

    fun loadFavoriteRecipes() {
        viewModelScope.launch {
            _favoriteUiState.value = FavoriteRecipesUiState.Loading
            try {
                val favorites = repository.getFavoriteRecipes()
                _favoriteUiState.value = FavoriteRecipesUiState.Success(favorites)
            } catch (e: Exception) {
                _favoriteUiState.value = FavoriteRecipesUiState.Error(e.message ?: "Gagal memuat favorit")
            }
        }
    }

    fun toggleFavorite(recipe: Recipe) {
        viewModelScope.launch {
            val newState = !recipe.isFavorite
            repository.toggleFavorite(recipe, newState)

            val listState = _listUiState.value
            if (listState is RecipeListUiState.Success) {
                _listUiState.value = listState.copy(
                    recipes = listState.recipes.map {
                        if (it.id == recipe.id) it.copy(isFavorite = newState) else it
                    }
                )
            }

            val detailState = _detailUiState.value
            if (detailState is RecipeDetailUiState.Success && detailState.recipe.id == recipe.id) {
                _detailUiState.value = RecipeDetailUiState.Success(detailState.recipe.copy(isFavorite = newState))
            }

            val favoriteState = _favoriteUiState.value
            if (favoriteState is FavoriteRecipesUiState.Success) {
                _favoriteUiState.value = FavoriteRecipesUiState.Success(
                    if (newState) {
                        (favoriteState.recipes + recipe.copy(isFavorite = true)).distinctBy { it.id }
                    } else {
                        favoriteState.recipes.filterNot { it.id == recipe.id }
                    }
                )
            }

            // Re-query from source of truth (Room) so Favorite page stays consistent.
            loadFavoriteRecipes()
        }
    }

    fun loadMoreRecipes() {
        val state = _listUiState.value
        if (state !is RecipeListUiState.Success || state.isLoadingMore || !state.hasMore) return

        viewModelScope.launch {
            _listUiState.value = state.copy(isLoadingMore = true)
            val nextPage = state.currentPage + 1
            val result = repository.getRecipesPage(
                page = nextPage,
                categoryId = currentCategoryId,
                search = currentSearch,
                perPage = 20
            )
            result.onSuccess { page ->
                val merged = (state.recipes + page.recipes).distinctBy { it.id }
                _listUiState.value = state.copy(
                    recipes = merged,
                    currentPage = page.currentPage,
                    hasMore = page.currentPage < page.lastPage,
                    isLoadingMore = false
                )
            }.onFailure {
                _listUiState.value = state.copy(isLoadingMore = false)
            }
        }
    }
}
