package com.example.cookedu.data.repository

import com.example.cookedu.data.local.dao.ShoppingItemDao
import com.example.cookedu.data.local.entities.ShoppingItemEntity
import com.example.cookedu.models.Ingredient
import com.example.cookedu.models.ShoppingItem
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

interface ShoppingListRepository {
    fun getShoppingList(): Flow<List<ShoppingItem>>
    suspend fun addShoppingItem(name: String, quantity: String, unit: String, category: String? = null)
    suspend fun updateShoppingItem(item: ShoppingItem)
    suspend fun deleteShoppingItem(id: Int)
    suspend fun toggleItemChecked(id: Int, isChecked: Boolean)
    suspend fun addIngredientsFromRecipe(recipeId: Int, ingredients: List<Ingredient>)
    suspend fun clearCheckedItems()
}

class ShoppingListRepositoryImpl(
    private val shoppingItemDao: ShoppingItemDao
) : ShoppingListRepository {

    override fun getShoppingList(): Flow<List<ShoppingItem>> {
        return shoppingItemDao.getAllShoppingItems().map { entities ->
            entities.map { 
                ShoppingItem(
                    id = it.id,
                    name = it.name,
                    quantity = it.quantity,
                    unit = it.unit,
                    isChecked = it.isChecked,
                    category = it.category
                )
            }
        }
    }

    override suspend fun addShoppingItem(name: String, quantity: String, unit: String, category: String?) {
        shoppingItemDao.insertShoppingItem(
            ShoppingItemEntity(
                name = name,
                quantity = quantity,
                unit = unit,
                category = category,
                isChecked = false
            )
        )
    }

    override suspend fun updateShoppingItem(item: ShoppingItem) {
        shoppingItemDao.insertShoppingItem(
            ShoppingItemEntity(
                id = item.id,
                name = item.name,
                quantity = item.quantity,
                unit = item.unit,
                category = item.category,
                isChecked = item.isChecked
            )
        )
    }

    override suspend fun deleteShoppingItem(id: Int) {
        shoppingItemDao.deleteShoppingItem(id)
    }

    override suspend fun toggleItemChecked(id: Int, isChecked: Boolean) {
        shoppingItemDao.updateItemCheckedStatus(id, isChecked)
    }

    override suspend fun addIngredientsFromRecipe(recipeId: Int, ingredients: List<Ingredient>) {
        val entities = ingredients.map {
            ShoppingItemEntity(
                name = it.item,
                quantity = it.amount ?: "",
                unit = it.unit ?: "",
                isChecked = false
            )
        }
        shoppingItemDao.insertShoppingItems(entities)
    }

    override suspend fun clearCheckedItems() {
        shoppingItemDao.deleteCheckedItems()
    }
}
