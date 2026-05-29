# CookEdu Room Database Documentation

## Overview

This package contains the Room database implementation for the CookEdu app, providing local caching and offline support for user data, recipes, recipe details, and shopping lists.

## Database Structure

### Version: 1

The database consists of 8 entities organized into logical groups:

### 1. User Management
- **UserEntity**: Stores user profile information
  - Primary Key: `id`
  - Unique Index: `email`
  - Fields: id, name, email, xp, rank, avatarUrl, createdAt

### 2. Recipe Management
- **RecipeEntity**: Stores basic recipe information for list views
  - Primary Key: `id`
  - Indexes: `title`, `difficulty`, `isFavorite`
  - Fields: id, title, description, imageUrl, difficulty, prepTime, cookTime, servings, calories, isFavorite, category, createdAt

- **RecipeDetailEntity**: Stores detailed recipe information
  - Primary Key: `id`
  - Fields: id, title, description, imageUrl, difficulty, prepTime, cookTime, servings, cachedAt

- **IngredientEntity**: Stores recipe ingredients
  - Primary Key: Auto-generated `id`
  - Foreign Key: `recipeId` → RecipeDetailEntity.id (CASCADE DELETE)
  - Index: `recipeId`
  - Fields: id, recipeId, ingredientId, name, quantity, unit

- **CookingStepEntity**: Stores recipe cooking steps
  - Primary Key: Auto-generated `id`
  - Foreign Key: `recipeId` → RecipeDetailEntity.id (CASCADE DELETE)
  - Index: `recipeId`
  - Fields: id, recipeId, stepNumber, instruction, imageUrl, duration

- **NutritionInfoEntity**: Stores nutritional information
  - Primary Key: Auto-generated `id`
  - Foreign Key: `recipeId` → RecipeDetailEntity.id (CASCADE DELETE)
  - Unique Index: `recipeId`
  - Fields: id, recipeId, calories, protein, carbs, fat

- **RecipeTagEntity**: Stores recipe tags
  - Composite Primary Key: `recipeId`, `tag`
  - Foreign Key: `recipeId` → RecipeDetailEntity.id (CASCADE DELETE)
  - Index: `recipeId`
  - Fields: recipeId, tag

### 3. Shopping List
- **ShoppingItemEntity**: Stores shopping list items
  - Primary Key: `id`
  - Indexes: `isChecked`, `category`
  - Fields: id, name, quantity, unit, isChecked, category, updatedAt

## Data Access Objects (DAOs)

### UserDao
Provides operations for user management:
- `insertUser(user)`: Insert or replace user
- `getUserById(userId)`: Get user by ID
- `getUserByEmail(email)`: Get user by email
- `getCurrentUser()`: Get the current logged-in user
- `clearAllUsers()`: Clear all users (logout)
- `updateUserProgress(userId, xp, rank)`: Update user XP and rank

### RecipeDao
Provides operations for recipe list management:
- `insertRecipe(recipe)`: Insert or replace single recipe
- `insertRecipes(recipes)`: Insert or replace multiple recipes
- `getAllRecipes()`: Get all recipes ordered by creation date
- `getRecipesByCategory(category)`: Get recipes filtered by category
- `getRecipeById(recipeId)`: Get single recipe by ID
- `getFavoriteRecipes()`: Get all favorite recipes
- `searchRecipes(query)`: Search recipes by title or description
- `updateFavoriteStatus(recipeId, isFavorite)`: Toggle favorite status
- `clearAllRecipes()`: Clear all recipes
- `replaceAllRecipes(recipes)`: Transaction to replace all recipes

### RecipeDetailDao
Provides operations for detailed recipe information:
- `insertRecipeDetail(recipeDetail)`: Insert or replace recipe detail
- `insertIngredients(ingredients)`: Insert or replace ingredients
- `insertCookingSteps(steps)`: Insert or replace cooking steps
- `insertNutritionInfo(nutritionInfo)`: Insert or replace nutrition info
- `insertTags(tags)`: Insert or replace tags
- `getRecipeDetail(recipeId)`: Get recipe detail by ID
- `getIngredients(recipeId)`: Get all ingredients for a recipe
- `getCookingSteps(recipeId)`: Get all cooking steps ordered by step number
- `getNutritionInfo(recipeId)`: Get nutrition info for a recipe
- `getTags(recipeId)`: Get all tags for a recipe
- `insertCompleteRecipeDetail(...)`: Transaction to insert complete recipe detail
- `deleteCompleteRecipeDetail(recipeId)`: Transaction to delete complete recipe detail

### ShoppingItemDao
Provides operations for shopping list management:
- `insertShoppingItem(item)`: Insert or replace single item
- `insertShoppingItems(items)`: Insert or replace multiple items
- `updateShoppingItem(item)`: Update existing item
- `getAllShoppingItems()`: Get all items ordered by checked status and update time
- `getShoppingItemById(itemId)`: Get single item by ID
- `getUncheckedItems()`: Get all unchecked items
- `getCheckedItems()`: Get all checked items
- `updateCheckedStatus(itemId, isChecked)`: Toggle checked status
- `deleteShoppingItem(itemId)`: Delete single item
- `deleteCheckedItems()`: Delete all checked items
- `clearAllShoppingItems()`: Clear all items

## Entity Mappers

The `EntityMappers.kt` file provides extension functions to convert between Room entities and domain models:

### User Mappers
- `User.toEntity()`: Convert User model to UserEntity
- `UserEntity.toModel()`: Convert UserEntity to User model

### Recipe Mappers
- `Recipe.toEntity(category)`: Convert Recipe model to RecipeEntity
- `RecipeEntity.toModel()`: Convert RecipeEntity to Recipe model

### RecipeDetail Mappers
- `RecipeDetail.toEntity()`: Convert RecipeDetail model to RecipeDetailEntity
- `RecipeDetailEntity.toModel(ingredients, steps, nutrition, tags)`: Convert RecipeDetailEntity to RecipeDetail model

### Ingredient Mappers
- `Ingredient.toEntity(recipeId)`: Convert Ingredient model to IngredientEntity
- `IngredientEntity.toModel()`: Convert IngredientEntity to Ingredient model

### CookingStep Mappers
- `CookingStep.toEntity(recipeId)`: Convert CookingStep model to CookingStepEntity
- `CookingStepEntity.toModel()`: Convert CookingStepEntity to CookingStep model

### NutritionInfo Mappers
- `NutritionInfo.toEntity(recipeId)`: Convert NutritionInfo model to NutritionInfoEntity
- `NutritionInfoEntity.toModel()`: Convert NutritionInfoEntity to NutritionInfo model

### RecipeTag Mappers
- `String.toTagEntity(recipeId)`: Convert tag string to RecipeTagEntity

### ShoppingItem Mappers
- `ShoppingItem.toEntity()`: Convert ShoppingItem model to ShoppingItemEntity
- `ShoppingItemEntity.toModel()`: Convert ShoppingItemEntity to ShoppingItem model

## Database Access

### Getting Database Instance

```kotlin
val database = CookEduDatabase.getDatabase(context)
```

The database uses a singleton pattern to ensure only one instance exists.

### Example Usage

#### Caching User Data
```kotlin
val user = User(id = 1, name = "John", email = "john@example.com", xp = 100, rank = "Beginner")
database.userDao().insertUser(user.toEntity())
```

#### Caching Recipes
```kotlin
val recipes = listOf(/* recipe list from API */)
val recipeEntities = recipes.map { it.toEntity() }
database.recipeDao().insertRecipes(recipeEntities)
```

#### Caching Complete Recipe Detail
```kotlin
val recipeDetail = /* recipe detail from API */
val recipeDetailEntity = recipeDetail.toEntity()
val ingredientEntities = recipeDetail.ingredients.map { it.toEntity(recipeDetail.id) }
val stepEntities = recipeDetail.steps.map { it.toEntity(recipeDetail.id) }
val nutritionEntity = recipeDetail.nutrition.toEntity(recipeDetail.id)
val tagEntities = recipeDetail.tags.map { it.toTagEntity(recipeDetail.id) }

database.recipeDetailDao().insertCompleteRecipeDetail(
    recipeDetailEntity,
    ingredientEntities,
    stepEntities,
    nutritionEntity,
    tagEntities
)
```

#### Retrieving Complete Recipe Detail
```kotlin
val recipeId = 1
val recipeDetailEntity = database.recipeDetailDao().getRecipeDetail(recipeId)
val ingredients = database.recipeDetailDao().getIngredients(recipeId).map { it.toModel() }
val steps = database.recipeDetailDao().getCookingSteps(recipeId).map { it.toModel() }
val nutrition = database.recipeDetailDao().getNutritionInfo(recipeId)?.toModel()
val tags = database.recipeDetailDao().getTags(recipeId)

val recipeDetail = recipeDetailEntity?.toModel(ingredients, steps, nutrition!!, tags)
```

#### Managing Shopping List
```kotlin
// Add item
val item = ShoppingItem(id = 1, name = "Tomatoes", quantity = "2", unit = "kg", isChecked = false)
database.shoppingItemDao().insertShoppingItem(item.toEntity())

// Toggle checked status
database.shoppingItemDao().updateCheckedStatus(itemId = 1, isChecked = true)

// Delete checked items
database.shoppingItemDao().deleteCheckedItems()
```

## Migration Strategy

### Current Version: 1
The database is currently in version 1 with `fallbackToDestructiveMigration()` enabled for development.

### Future Migrations
For production releases, proper migrations should be implemented in `DatabaseMigrations.kt` to preserve user data during schema changes.

Example migration:
```kotlin
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(database: SupportSQLiteDatabase) {
        database.execSQL("ALTER TABLE users ADD COLUMN bio TEXT")
    }
}
```

Then update the database builder:
```kotlin
Room.databaseBuilder(context, CookEduDatabase::class.java, "cookedu_database")
    .addMigrations(MIGRATION_1_2)
    .build()
```

## Performance Considerations

### Indexes
The database includes indexes on frequently queried columns:
- **users**: email (unique)
- **recipes**: title, difficulty, isFavorite
- **ingredients**: recipeId
- **cooking_steps**: recipeId
- **nutrition_info**: recipeId (unique)
- **recipe_tags**: recipeId
- **shopping_items**: isChecked, category

### Foreign Keys
Foreign keys with CASCADE DELETE ensure data integrity:
- When a RecipeDetailEntity is deleted, all related ingredients, steps, nutrition info, and tags are automatically deleted

### Transactions
Use `@Transaction` annotation for operations that need to be atomic:
- `insertCompleteRecipeDetail()`: Ensures all recipe detail components are inserted together
- `deleteCompleteRecipeDetail()`: Ensures all recipe detail components are deleted together
- `replaceAllRecipes()`: Ensures recipes are cleared and replaced atomically

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 19.1**: Uses Room for data persistence ✓
- **Requirement 19.2**: Caches recipes from backend ✓
- **Requirement 19.3**: Caches user data ✓
- **Requirement 19.6**: Creates indexes on recipe title, difficulty, and isFavorite columns ✓

Additional indexes created for performance:
- User email (unique)
- Shopping items: isChecked, category
- Recipe detail relationships: recipeId indexes on all child tables
