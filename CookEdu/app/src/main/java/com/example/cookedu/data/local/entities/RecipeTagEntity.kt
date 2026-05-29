package com.example.cookedu.data.local.entities

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index

@Entity(
    tableName = "recipe_tags",
    primaryKeys = ["recipeId", "tag"],
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
data class RecipeTagEntity(
    val recipeId: Int,
    val tag: String
)
