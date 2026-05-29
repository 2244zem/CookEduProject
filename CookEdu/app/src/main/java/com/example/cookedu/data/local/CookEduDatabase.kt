package com.example.cookedu.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.cookedu.data.local.dao.RecipeDao
import com.example.cookedu.data.local.dao.RecipeDetailDao
import com.example.cookedu.data.local.dao.ShoppingItemDao
import com.example.cookedu.data.local.dao.UserDao
import com.example.cookedu.data.local.entities.CookingStepEntity
import com.example.cookedu.data.local.entities.IngredientEntity
import com.example.cookedu.data.local.entities.NutritionInfoEntity
import com.example.cookedu.data.local.entities.RecipeDetailEntity
import com.example.cookedu.data.local.entities.RecipeEntity
import com.example.cookedu.data.local.entities.RecipeTagEntity
import com.example.cookedu.data.local.entities.ShoppingItemEntity
import com.example.cookedu.data.local.entities.UserEntity

@Database(
    entities = [
        UserEntity::class,
        RecipeEntity::class,
        RecipeDetailEntity::class,
        IngredientEntity::class,
        CookingStepEntity::class,
        NutritionInfoEntity::class,
        RecipeTagEntity::class,
        ShoppingItemEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class CookEduDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun recipeDao(): RecipeDao
    abstract fun recipeDetailDao(): RecipeDetailDao
    abstract fun shoppingItemDao(): ShoppingItemDao

    companion object {
        @Volatile
        private var INSTANCE: CookEduDatabase? = null

        fun getDatabase(context: Context): CookEduDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    CookEduDatabase::class.java,
                    "cookedu_database"
                )
                    .addMigrations(DatabaseMigrations.MIGRATION_1_2)
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
