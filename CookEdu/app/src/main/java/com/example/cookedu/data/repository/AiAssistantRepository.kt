package com.example.cookedu.data.repository

import com.example.cookedu.api.ApiService
import com.example.cookedu.models.ChefAiRequest
import com.example.cookedu.models.ChefAiResponse

import com.example.cookedu.models.ChefAiRecommendRequest

interface AiAssistantRepository {
    suspend fun sendMessage(prompt: String, history: List<Map<String, Any>>): Result<ChefAiResponse>
    suspend fun getRecipeRecommendation(ingredients: List<String>): Result<ChefAiResponse>
    suspend fun getCookingTips(recipeId: Int): Result<ChefAiResponse>
}

class AiAssistantRepositoryImpl(
    private val apiService: ApiService
) : AiAssistantRepository {

    override suspend fun sendMessage(prompt: String, history: List<Map<String, Any>>): Result<ChefAiResponse> {
        return try {
            val response = apiService.sendAiMessage(ChefAiRequest(prompt, history))
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Empty response body"))
            } else {
                Result.failure(Exception("API Error: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getRecipeRecommendation(ingredients: List<String>): Result<ChefAiResponse> {
        return try {
            val response = apiService.getRecipeRecommendations(ChefAiRecommendRequest(ingredients))
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Empty response body"))
            } else {
                Result.failure(Exception("API Error: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getCookingTips(recipeId: Int): Result<ChefAiResponse> {
        return try {
            val response = apiService.getCookingTips(recipeId)
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Empty response body"))
            } else {
                Result.failure(Exception("API Error: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
