package com.example.cookedu.api

import com.example.cookedu.models.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Authentication endpoints
    @POST("api/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("api/register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>

    @POST("api/logout")
    suspend fun logout(): Response<LogoutResponse>
    
    @GET("api/profile")
    suspend fun getProfile(): Response<ProfileResponse>

    @Multipart
    @POST("api/profile")
    suspend fun updateProfile(
        @Part("_method") method: RequestBody,
        @Part("name") name: RequestBody? = null,
        @Part("phone") phone: RequestBody? = null,
        @Part avatar: MultipartBody.Part? = null
    ): Response<UpdateProfileResponse>

    @POST("api/user/add-xp")
    @FormUrlEncoded
    suspend fun addXp(@Field("amount") amount: Int): Response<AddXpResponse>

    // Recipe endpoints
    @GET("api/recipes")
    suspend fun getRecipes(
        @Query("category_id") categoryId: Int? = null,
        @Query("search") search: String? = null,
        @Query("difficulty") difficulty: String? = null,
        @Query("max_cooking_time") maxCookingTime: Int? = null,
        @Query("ingredient") ingredient: String? = null,
        @Query("page") page: Int? = null,
        @Query("per_page") perPage: Int? = null,
        @Query("sort_by") sortBy: String? = null,
        @Query("sort_dir") sortDir: String? = null
    ): Response<RecipeResponse>

    @GET("api/recipes/{id}")
    suspend fun getRecipeById(@Path("id") id: Int): Response<RecipeDetailResponse>

    // Category endpoints
    @GET("api/categories")
    suspend fun getCategories(): Response<CategoryResponse>

    // AI Assistant endpoint
    @POST("api/chef-ai")
    suspend fun sendAiMessage(@Body request: ChefAiRequest): Response<ChefAiResponse>

    @POST("api/chef-ai/recommend")
    suspend fun getRecipeRecommendations(@Body request: ChefAiRecommendRequest): Response<ChefAiResponse>

    @GET("api/chef-ai/tips/{recipeId}")
    suspend fun getCookingTips(@Path("recipeId") recipeId: Int): Response<ChefAiResponse>
}
