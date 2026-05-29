package com.example.cookedu.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "recipe_details")
data class RecipeDetailEntity(
    @PrimaryKey
    val id: Int,
    val title: String,
    val description: String,
    val imageUrl: String?,
    val difficulty: String,
    val prepTime: Int,
    val cookTime: Int,
    val servings: Int,
    val cachedAt: Long = System.currentTimeMillis()
)
