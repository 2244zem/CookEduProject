package com.example.cookedu.models

import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonParseException
import com.google.gson.annotations.JsonAdapter
import com.google.gson.annotations.SerializedName
import java.lang.reflect.Type

// Authentication Models
data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val user: User,
    val token: String,
    val message: String? = null
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    @SerializedName("password_confirmation") val passwordConfirmation: String,
    val phone: String? = null
)

data class RegisterResponse(
    val user: User,
    val token: String,
    val message: String? = null
)

data class ProfileResponse(
    val user: User
)

data class UpdateProfileResponse(
    val message: String? = null,
    val user: User
)

data class LogoutResponse(
    val message: String
)

data class AddXpResponse(
    val message: String,
    val xp: Int,
    val user: User
)

data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: String? = null,
    val phone: String? = null,
    val xp: Int,
    @SerializedName("avatar_url") val avatarUrl: String? = null,
    val preferences: UserPreferences? = null,
    @SerializedName("created_at") val createdAt: String? = null
)

data class UserPreferences(
    val diet: String? = null,
    @SerializedName("skill_level") val skillLevel: String? = null
)

// Recipe Models
data class RecipeResponse(
    val data: List<Recipe>,
    val meta: PaginationMeta? = null
)

data class PaginationMeta(
    @SerializedName("current_page") val currentPage: Int,
    @SerializedName("last_page") val lastPage: Int,
    val total: Int
)

data class Recipe(
    val id: Int,
    val title: String,
    val slug: String? = null,
    val description: String?,
    @SerializedName("image_url") val imageUrl: String?,
    val difficulty: String?,
    @SerializedName("cooking_time") val cookingTime: Int? = null,
    @SerializedName("prep_time") val prepTime: Int? = null,
    val ingredients: List<Ingredient>? = null,
    @JsonAdapter(RecipeStepsDeserializer::class)
    val steps: List<String>? = null,
    @SerializedName("nutritional_info") val nutritionalInfo: NutritionInfo? = null,
    @SerializedName("is_published") val isPublished: Boolean = false,
    @SerializedName("moderation_status") val moderationStatus: String? = null,
    val isFavorite: Boolean = false,
    val creator: Creator? = null,
    val category: Category? = null
)

class RecipeStepsDeserializer : JsonDeserializer<List<String>> {
    @Throws(JsonParseException::class)
    override fun deserialize(
        json: JsonElement?,
        typeOfT: Type?,
        context: JsonDeserializationContext?
    ): List<String> {
        if (json == null || json.isJsonNull) return emptyList()

        return when {
            json.isJsonArray -> json.asJsonArray.mapNotNull { element ->
                when {
                    element.isJsonNull -> null
                    element.isJsonPrimitive -> element.asString
                    element.isJsonObject -> {
                        val stepObject = element.asJsonObject
                        when {
                            stepObject.has("instruction") && !stepObject.get("instruction").isJsonNull ->
                                stepObject.get("instruction").asString
                            stepObject.has("text") && !stepObject.get("text").isJsonNull ->
                                stepObject.get("text").asString
                            else -> null
                        }
                    }
                    else -> null
                }
            }
            json.isJsonPrimitive -> listOf(json.asString)
            else -> emptyList()
        }
    }
}

data class RecipeDetailResponse(
    val data: Recipe
)

data class Ingredient(
    val item: String,
    val amount: String? = null,
    val unit: String? = null
)

data class NutritionInfo(
    val calories: Int? = null,
    val protein: Double? = null,
    val carbs: Double? = null,
    val fat: Double? = null
)

data class Creator(
    val id: Int,
    val name: String,
    val role: String
)

data class Category(
    val id: Int,
    val name: String,
    val slug: String? = null,
    @SerializedName("icon_url") val iconUrl: String? = null
)

data class CategoryResponse(
    val data: List<Category>
)

// Shopping List Models (Local only, no API equivalents right now)
data class ShoppingItem(
    val id: Int,
    val name: String,
    val quantity: String,
    val unit: String,
    @SerializedName("is_checked") val isChecked: Boolean,
    val category: String? = null
)

// AI Assistant Models
data class ChefAiRequest(
    val prompt: String,
    val history: List<Map<String, Any>> = emptyList()
)

data class ChefAiRecommendRequest(
    val ingredients: List<String>
)

data class ChefAiResponse(
    val success: Boolean,
    val reply: String,
    val cached: Boolean? = null
)

// Generic API Response Wrapper
data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val message: String?
)
