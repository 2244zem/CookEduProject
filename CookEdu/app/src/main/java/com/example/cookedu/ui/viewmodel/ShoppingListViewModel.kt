package com.example.cookedu.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cookedu.data.repository.ShoppingListRepository
import com.example.cookedu.models.Ingredient
import com.example.cookedu.models.ShoppingItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch

sealed class ShoppingListUiState {
    object Loading : ShoppingListUiState()
    data class Success(val items: List<ShoppingItem>) : ShoppingListUiState()
    data class Error(val message: String) : ShoppingListUiState()
}

class ShoppingListViewModel(private val repository: ShoppingListRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<ShoppingListUiState>(ShoppingListUiState.Loading)
    val uiState: StateFlow<ShoppingListUiState> = _uiState

    init {
        loadItems()
    }

    fun loadItems() {
        viewModelScope.launch {
            _uiState.value = ShoppingListUiState.Loading
            repository.getShoppingList()
                .catch { e ->
                    _uiState.value = ShoppingListUiState.Error(e.message ?: "Failed to load shopping list")
                }
                .collect { items ->
                    _uiState.value = ShoppingListUiState.Success(items)
                }
        }
    }

    fun addItem(name: String, quantity: String, unit: String, category: String? = null) {
        viewModelScope.launch {
            repository.addShoppingItem(name, quantity, unit, category)
        }
    }

    fun updateItem(item: ShoppingItem) {
        viewModelScope.launch {
            repository.updateShoppingItem(item)
        }
    }

    fun deleteItem(id: Int) {
        viewModelScope.launch {
            repository.deleteShoppingItem(id)
        }
    }

    fun toggleItemChecked(id: Int, isChecked: Boolean) {
        viewModelScope.launch {
            repository.toggleItemChecked(id, isChecked)
        }
    }

    fun addIngredientsFromRecipe(recipeId: Int, ingredients: List<Ingredient>) {
        viewModelScope.launch {
            repository.addIngredientsFromRecipe(recipeId, ingredients)
        }
    }

    fun clearCheckedItems() {
        viewModelScope.launch {
            repository.clearCheckedItems()
        }
    }
}