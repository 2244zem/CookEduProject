package com.example.cookedu.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "recipes",
    indices = [
        Index(value = ["title"]),
        Index(value = ["difficulty"]),
        Index(value = ["isFavorite"])
    ]
)
data class RecipeEntity(
    @PrimaryKey
    val id: Int,
    val title: String,
    val description: String?,
    val imageUrl: String?,
    val difficulty: String,
    val prepTime: Int,
    val cookTime: Int?,
    val servings: Int?,
    val calories: Int?,
    val isFavorite: Boolean = false,
    val category: String?,
    val createdAt: Long = System.currentTimeMillis()
)
