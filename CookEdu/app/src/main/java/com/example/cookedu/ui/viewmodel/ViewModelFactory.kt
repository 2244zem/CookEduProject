package com.example.cookedu.ui.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.cookedu.api.ApiClient
import com.example.cookedu.data.EncryptedTokenManager
import com.example.cookedu.data.local.CookEduDatabase
import com.example.cookedu.data.repository.*

class ViewModelFactory(private val context: Context) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        val database = CookEduDatabase.getDatabase(context)
        val apiService = ApiClient.getService(context)
        val tokenManager = EncryptedTokenManager(context)

        val viewModel: ViewModel = when {
            modelClass.isAssignableFrom(AuthViewModel::class.java) -> {
                val repository = AuthRepositoryImpl(apiService, tokenManager, database.userDao())
                AuthViewModel(repository)
            }
            modelClass.isAssignableFrom(RecipeViewModel::class.java) -> {
                val repository = RecipeRepositoryImpl(apiService, database.recipeDao(), database.recipeDetailDao())
                RecipeViewModel(repository)
            }
            modelClass.isAssignableFrom(ShoppingListViewModel::class.java) -> {
                val repository = ShoppingListRepositoryImpl(database.shoppingItemDao())
                ShoppingListViewModel(repository)
            }
            modelClass.isAssignableFrom(AiAssistantViewModel::class.java) -> {
                val repository = AiAssistantRepositoryImpl(apiService)
                AiAssistantViewModel(repository)
            }
            modelClass.isAssignableFrom(DashboardViewModel::class.java) -> {
                val authRepo = AuthRepositoryImpl(apiService, tokenManager, database.userDao())
                val recipeRepo = RecipeRepositoryImpl(apiService, database.recipeDao(), database.recipeDetailDao())
                DashboardViewModel(authRepo, recipeRepo)
            }
            modelClass.isAssignableFrom(ProfileViewModel::class.java) -> {
                val repository = AuthRepositoryImpl(apiService, tokenManager, database.userDao())
                ProfileViewModel(repository)
            }
            else -> throw IllegalArgumentException("Unknown ViewModel class")
        }

        @Suppress("UNCHECKED_CAST")
        return viewModel as T
    }
}
