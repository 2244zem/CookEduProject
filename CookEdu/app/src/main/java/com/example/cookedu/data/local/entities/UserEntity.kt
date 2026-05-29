package com.example.cookedu.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "users",
    indices = [Index(value = ["email"], unique = true)]
)
data class UserEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val email: String,
    val xp: Int,
    val role: String?,
    val phone: String?,
    val avatarUrl: String?,
    val createdAt: String
)
