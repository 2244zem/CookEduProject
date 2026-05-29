package com.example.cookedu.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import com.example.cookedu.data.local.entities.CookingStepEntity
import com.example.cookedu.data.local.entities.IngredientEntity
import com.example.cookedu.data.local.entities.NutritionInfoEntity
import com.example.cookedu.data.local.entities.RecipeDetailEntity
import com.example.cookedu.data.local.entities.RecipeTagEntity

@Dao
interface RecipeDetailDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecipeDetail(recipeDetail: RecipeDetailEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertIngredients(ingredients: List<IngredientEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCookingSteps(steps: List<CookingStepEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNutritionInfo(nutritionInfo: NutritionInfoEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTags(tags: List<RecipeTagEntity>)

    @Query("SELECT * FROM recipe_details WHERE id = :recipeId LIMIT 1")
    suspend fun getRecipeDetail(recipeId: Int): RecipeDetailEntity?

    @Query("SELECT * FROM ingredients WHERE recipeId = :recipeId ORDER BY id")
    suspend fun getIngredients(recipeId: Int): List<IngredientEntity>

    @Query("SELECT * FROM cooking_steps WHERE recipeId = :recipeId ORDER BY stepNumber")
    suspend fun getCookingSteps(recipeId: Int): List<CookingStepEntity>

    @Query("SELECT * FROM nutrition_info WHERE recipeId = :recipeId LIMIT 1")
    suspend fun getNutritionInfo(recipeId: Int): NutritionInfoEntity?

    @Query("SELECT tag FROM recipe_tags WHERE recipeId = :recipeId")
    suspend fun getTags(recipeId: Int): List<String>

    @Query("DELETE FROM ingredients WHERE recipeId = :recipeId")
    suspend fun deleteIngredients(recipeId: Int)

    @Query("DELETE FROM cooking_steps WHERE recipeId = :recipeId")
    suspend fun deleteCookingSteps(recipeId: Int)

    @Query("DELETE FROM nutrition_info WHERE recipeId = :recipeId")
    suspend fun deleteNutritionInfo(recipeId: Int)

    @Query("DELETE FROM recipe_tags WHERE recipeId = :recipeId")
    suspend fun deleteTags(recipeId: Int)

    @Query("DELETE FROM recipe_details WHERE id = :recipeId")
    suspend fun deleteRecipeDetail(recipeId: Int)

    @Transaction
    suspend fun insertCompleteRecipeDetail(
        recipeDetail: RecipeDetailEntity,
        ingredients: List<IngredientEntity>,
        steps: List<CookingStepEntity>,
        nutritionInfo: NutritionInfoEntity,
        tags: List<RecipeTagEntity>
    ) {
        insertRecipeDetail(recipeDetail)
        deleteIngredients(recipeDetail.id)
        deleteCookingSteps(recipeDetail.id)
        deleteNutritionInfo(recipeDetail.id)
        deleteTags(recipeDetail.id)
        insertIngredients(ingredients)
        insertCookingSteps(steps)
        insertNutritionInfo(nutritionInfo)
        insertTags(tags)
    }

    @Transaction
    suspend fun deleteCompleteRecipeDetail(recipeId: Int) {
        deleteIngredients(recipeId)
        deleteCookingSteps(recipeId)
        deleteNutritionInfo(recipeId)
        deleteTags(recipeId)
        deleteRecipeDetail(recipeId)
    }
}
