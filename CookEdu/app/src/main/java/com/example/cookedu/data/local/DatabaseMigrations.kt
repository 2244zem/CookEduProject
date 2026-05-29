package com.example.cookedu.data.local

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

/**
 * Database Migration Strategy for CookEdu
 * 
 * Current Version: 1
 * 
 * Migration Strategy:
 * - For development phase: Using fallbackToDestructiveMigration() to allow schema changes
 * - For production: Implement proper migrations to preserve user data
 * 
 * Future Migrations:
 * - Version 1 -> 2: Add any new columns or tables as needed
 * - Always test migrations with real data before production release
 * 
 * Example Migration (for future use):
 * val MIGRATION_1_2 = object : Migration(1, 2) {
 *     override fun migrate(database: SupportSQLiteDatabase) {
 *         // Example: Add new column to users table
 *         database.execSQL("ALTER TABLE users ADD COLUMN bio TEXT")
 *     }
 * }
 * 
 * To use migrations in production:
 * Room.databaseBuilder(context, CookEduDatabase::class.java, "cookedu_database")
 *     .addMigrations(MIGRATION_1_2, MIGRATION_2_3, ...)
 *     .build()
 */

object DatabaseMigrations {
    val MIGRATION_1_2 = object : Migration(1, 2) {
        override fun migrate(database: SupportSQLiteDatabase) {
            // Add columns only when absent to avoid duplicate-column crashes.
            addColumnIfMissing(database, "users", "role", "TEXT")
            addColumnIfMissing(database, "users", "phone", "TEXT")
            addColumnIfMissing(database, "users", "avatarUrl", "TEXT")
            addColumnIfMissing(database, "users", "createdAt", "TEXT NOT NULL DEFAULT ''")

            // Copy old rank value (if available) into role for backward compatibility.
            if (hasColumn(database, "users", "rank")) {
                database.execSQL("UPDATE users SET role = rank WHERE role IS NULL")
            }
        }
    }

    private fun addColumnIfMissing(
        database: SupportSQLiteDatabase,
        tableName: String,
        columnName: String,
        columnDefinition: String
    ) {
        if (!hasColumn(database, tableName, columnName)) {
            database.execSQL("ALTER TABLE $tableName ADD COLUMN $columnName $columnDefinition")
        }
    }

    private fun hasColumn(
        database: SupportSQLiteDatabase,
        tableName: String,
        columnName: String
    ): Boolean {
        database.query("PRAGMA table_info($tableName)").use { cursor ->
            val nameIndex = cursor.getColumnIndex("name")
            while (cursor.moveToNext()) {
                if (nameIndex >= 0 && cursor.getString(nameIndex) == columnName) {
                    return true
                }
            }
        }
        return false
    }
}
