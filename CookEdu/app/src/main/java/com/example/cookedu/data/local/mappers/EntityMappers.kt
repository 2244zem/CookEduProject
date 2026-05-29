package com.example.cookedu.data.local.mappers

import com.example.cookedu.data.local.entities.CookingStepEntity
import com.example.cookedu.data.local.entities.IngredientEntity
import com.example.cookedu.data.local.entities.NutritionInfoEntity
import com.example.cookedu.data.local.entities.RecipeDetailEntity
import com.example.cookedu.data.local.entities.RecipeEntity
import com.example.cookedu.data.local.entities.RecipeTagEntity
import com.example.cookedu.data.local.entities.ShoppingItemEntity
import com.example.cookedu.data.local.entities.UserEntity
import com.example.cookedu.models.Ingredient
import com.example.cookedu.models.NutritionInfo
import com.example.cookedu.models.Recipe
import com.example.cookedu.models.ShoppingItem
import com.example.cookedu.models.User
import com.example.cookedu.models.Category

// User Mappers
fun User.toEntity(): UserEntity {
    return UserEntity(
        id = id,
        name = name,
        email = email,
        xp = xp,
        role = role,
        phone = phone,
        avatarUrl = avatarUrl,
        createdAt = createdAt ?: ""
    )
}

fun UserEntity.toModel(): User {
    return User(
        id = id,
        name = name,
        email = email,
        xp = xp,
        role = role,
        phone = phone,
        avatarUrl = avatarUrl,
        createdAt = createdAt
    )
}

// Recipe Mappers
fun Recipe.toEntity(): RecipeEntity {
    return RecipeEntity(
        id = id,
        title = title,
        description = description,
        imageUrl = imageUrl,
        difficulty = difficulty ?: "Medium",
        prepTime = prepTime ?: 0,
        cookTime = cookingTime,
        servings = null,
        calories = nutritionalInfo?.calories,
        isFavorite = isFavorite,
        category = category?.name
    )
}

fun RecipeEntity.toModel(): Recipe {
    return Recipe(
        id = id,
        title = title,
        description = description,
        imageUrl = imageUrl,
        difficulty = difficulty,
        prepTime = prepTime,
        cookingTime = cookTime,
        isFavorite = isFavorite,
        nutritionalInfo = if (calories != null) NutritionInfo(calories = calories) else null,
        category = category?.let { Category(id = 0, name = it) }
    )
}

// Ingredient Mappers
fun Ingredient.toEntity(recipeId: Int): IngredientEntity {
    return IngredientEntity(
        recipeId = recipeId,
        ingredientId = item.hashCode(),
        name = item,
        quantity = amount ?: "",
        unit = unit ?: ""
    )
}

fun IngredientEntity.toModel(): Ingredient {
    return Ingredient(
        item = name,
        amount = quantity,
        unit = unit
    )
}

// ShoppingItem Mappers
fun ShoppingItem.toEntity(): ShoppingItemEntity {
    return ShoppingItemEntity(
        id = id,
        name = name,
        quantity = quantity,
        unit = unit,
        isChecked = isChecked,
        category = category
    )
}

fun ShoppingItemEntity.toModel(): ShoppingItem {
    return ShoppingItem(
        id = id,
        name = name,
        quantity = quantity,
        unit = unit,
        isChecked = isChecked,
        category = category
    )
}

fun Recipe.toDetailEntity(): RecipeDetailEntity {
    return RecipeDetailEntity(
        id = id,
        title = title,
        description = description ?: "",
        imageUrl = imageUrl,
        difficulty = difficulty ?: "Medium",
        prepTime = prepTime ?: 0,
        cookTime = cookingTime ?: 0,
        servings = 1, // Default if missing
        cachedAt = System.currentTimeMillis()
    )
}

fun RecipeDetailEntity.toModel(
    ingredientsList: List<IngredientEntity>,
    stepsList: List<CookingStepEntity>,
    nutrition: NutritionInfoEntity? = null
): Recipe {
    return Recipe(
        id = id,
        title = title,
        description = description,
        imageUrl = imageUrl,
        difficulty = difficulty,
        prepTime = prepTime,
        cookingTime = cookTime,
        ingredients = ingredientsList.map { it.toModel() },
        steps = stepsList.map { it.instruction },
        nutritionalInfo = nutrition?.let {
            NutritionInfo(calories = it.calories, protein = it.protein.toDouble(), carbs = it.carbs.toDouble(), fat = it.fat.toDouble())
        }
    )
}

fun String.toCookingStepEntity(recipeId: Int, stepNumber: Int): CookingStepEntity {
    return CookingStepEntity(
        recipeId = recipeId,
        stepNumber = stepNumber,
        instruction = this,
        imageUrl = null,
        duration = null
    )
}
