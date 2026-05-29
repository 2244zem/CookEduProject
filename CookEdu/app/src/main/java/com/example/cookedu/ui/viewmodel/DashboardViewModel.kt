package com.example.cookedu.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cookedu.data.repository.AuthRepository
import com.example.cookedu.data.repository.RecipeRepository
import com.example.cookedu.models.Recipe
import com.example.cookedu.models.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch

sealed class DashboardUiState {
    object Loading : DashboardUiState()
    data class Success(
        val user: User?,
        val highlightRecipes: List<Recipe>,
        val categories: List<com.example.cookedu.models.Category> = emptyList(),
        val isUsingFallbackData: Boolean = false,
        val errorMessage: String? = null
    ) : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}

class DashboardViewModel(
    private val authRepository: AuthRepository,
    private val recipeRepository: RecipeRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState

    init {
        loadDashboardData()
    }

    fun loadDashboardData() {
        viewModelScope.launch {
            _uiState.value = DashboardUiState.Loading
            
            val currentUser: User? = authRepository.getCurrentUser().firstOrNull()
            var recipes: List<Recipe> = emptyList()
            var categories: List<com.example.cookedu.models.Category> = emptyList()
            var errorMessage: String? = null

            // Fetch categories
            val catResult = recipeRepository.getCategories()
            catResult.onSuccess { cats ->
                categories = cats
                updateSuccessState(currentUser, recipes, categories, errorMessage)
            }.onFailure { e ->
                errorMessage = "Gagal memuat kategori: ${e.message}"
                updateSuccessState(currentUser, recipes, categories, errorMessage)
            }

            // Fetch highlighted recipes - force refresh to get latest data
            recipeRepository.getRecipes(forceRefresh = true)
                .catch { e ->
                    errorMessage = "Gagal memuat resep: ${e.message}"
                    updateSuccessState(currentUser, recipes, categories, errorMessage)
                }
                .collect { result ->
                    result.onSuccess { r ->
                        recipes = r.take(8)
                        val finalCategories = if (categories.isEmpty()) {
                            emptyList()
                        } else categories
                        updateSuccessState(currentUser, recipes, finalCategories, errorMessage)
                    }.onFailure { e ->
                        errorMessage = "Gagal memuat resep: ${e.message}"
                        val finalCategories = if (categories.isEmpty()) emptyList() else categories
                        updateSuccessState(currentUser, recipes, finalCategories, errorMessage)
                    }
                }
        }
    }

    private fun updateSuccessState(
        user: User?, 
        recipes: List<Recipe>, 
        categories: List<com.example.cookedu.models.Category>,
        errorMessage: String?
    ) {
        _uiState.value = DashboardUiState.Success(
            user = user,
            highlightRecipes = recipes,
            categories = categories,
            isUsingFallbackData = false,
            errorMessage = errorMessage
        )
    }
}