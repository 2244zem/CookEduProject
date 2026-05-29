package com.example.cookedu.data.local.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "cooking_steps",
    foreignKeys = [
        ForeignKey(
            entity = RecipeDetailEntity::class,
            parentColumns = ["id"],
            childColumns = ["recipeId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["recipeId"])]
)
data class CookingStepEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val recipeId: Int,
    val stepNumber: Int,
    val instruction: String,
    val imageUrl: String?,
    val duration: Int?
)
