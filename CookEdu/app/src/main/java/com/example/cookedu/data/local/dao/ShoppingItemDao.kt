package com.example.cookedu.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.cookedu.data.local.entities.ShoppingItemEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ShoppingItemDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertShoppingItem(item: ShoppingItemEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertShoppingItems(items: List<ShoppingItemEntity>)

    @Update
    suspend fun updateShoppingItem(item: ShoppingItemEntity)

    @Query("SELECT * FROM shopping_items ORDER BY isChecked ASC, updatedAt DESC")
    fun getAllShoppingItems(): Flow<List<ShoppingItemEntity>>

    @Query("SELECT * FROM shopping_items WHERE id = :itemId LIMIT 1")
    suspend fun getShoppingItemById(itemId: Int): ShoppingItemEntity?

    @Query("SELECT * FROM shopping_items WHERE isChecked = 0 ORDER BY updatedAt DESC")
    suspend fun getUncheckedItems(): List<ShoppingItemEntity>

    @Query("SELECT * FROM shopping_items WHERE isChecked = 1 ORDER BY updatedAt DESC")
    suspend fun getCheckedItems(): List<ShoppingItemEntity>

    @Query("UPDATE shopping_items SET isChecked = :isChecked, updatedAt = :updatedAt WHERE id = :itemId")
    suspend fun updateCheckedStatus(itemId: Int, isChecked: Boolean, updatedAt: Long = System.currentTimeMillis())

    // Backward-compatible name used by repository
    suspend fun updateItemCheckedStatus(itemId: Int, isChecked: Boolean) =
        updateCheckedStatus(itemId = itemId, isChecked = isChecked)

    @Query("DELETE FROM shopping_items WHERE id = :itemId")
    suspend fun deleteShoppingItem(itemId: Int)

    @Query("DELETE FROM shopping_items WHERE isChecked = 1")
    suspend fun deleteCheckedItems()

    @Query("DELETE FROM shopping_items")
    suspend fun clearAllShoppingItems()
}
