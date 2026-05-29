package com.example.cookedu.data.local.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "nutrition_info",
    foreignKeys = [
        ForeignKey(
            entity = RecipeDetailEntity::class,
            parentColumns = ["id"],
            childColumns = ["recipeId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["recipeId"], unique = true)]
)
data class NutritionInfoEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val recipeId: Int,
    val calories: Int,
    val protein: Int,
    val carbs: Int,
    val fat: Int
)
