package com.example.cookedu.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "shopping_items",
    indices = [
        Index(value = ["isChecked"]),
        Index(value = ["category"])
    ]
)
data class ShoppingItemEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val name: String,
    val quantity: String,
    val unit: String,
    val isChecked: Boolean = false,
    val category: String? = null,
    val updatedAt: Long = System.currentTimeMillis()
)
