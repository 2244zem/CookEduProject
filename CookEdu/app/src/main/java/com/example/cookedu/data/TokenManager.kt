package com.example.cookedu.data

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.util.concurrent.TimeUnit

/**
 * Interface for managing authentication tokens securely.
 * Provides methods to save, retrieve, validate, and clear authentication tokens.
 */
interface TokenManager {
    /**
     * Saves the authentication token securely.
     * @param token The authentication token to save
     */
    fun saveToken(token: String)
    
    /**
     * Retrieves the saved authentication token.
     * @return The authentication token or null if not found
     */
    fun getToken(): String?
    
    /**
     * Clears the saved authentication token.
     */
    fun clearToken()
    
    /**
     * Checks if a valid token exists.
     * @return true if a valid token exists, false otherwise
     */
    fun isTokenValid(): Boolean
    
    /**
     * Saves the token expiration timestamp.
     * @param expirationTimeMillis The expiration time in milliseconds since epoch
     */
    fun saveTokenExpiration(expirationTimeMillis: Long)
    
    /**
     * Gets the token expiration timestamp.
     * @return The expiration time in milliseconds since epoch, or null if not set
     */
    fun getTokenExpiration(): Long?
}

/**
 * Implementation of TokenManager using encrypted SharedPreferences.
 * Uses AndroidX Security Crypto library to encrypt sensitive token data.
 */
class EncryptedTokenManager(context: Context) : TokenManager {
    
    companion object {
        private const val PREFS_FILE_NAME = "cookedu_secure_prefs"
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_TOKEN_EXPIRATION = "token_expiration"
        private const val TOKEN_VALIDITY_DAYS = 30L // Default token validity period
    }
    
    private val sharedPreferences: SharedPreferences
    
    init {
        // Create or retrieve the master key for encryption
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        
        // Create encrypted SharedPreferences
        sharedPreferences = EncryptedSharedPreferences.create(
            context,
            PREFS_FILE_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }
    
    override fun saveToken(token: String) {
        sharedPreferences.edit().apply {
            putString(KEY_AUTH_TOKEN, token)
            // Set default expiration to 30 days from now if not explicitly set
            if (!sharedPreferences.contains(KEY_TOKEN_EXPIRATION)) {
                val expirationTime = System.currentTimeMillis() + 
                    TimeUnit.DAYS.toMillis(TOKEN_VALIDITY_DAYS)
                putLong(KEY_TOKEN_EXPIRATION, expirationTime)
            }
            apply()
        }
    }
    
    override fun getToken(): String? {
        return sharedPreferences.getString(KEY_AUTH_TOKEN, null)
    }
    
    override fun clearToken() {
        sharedPreferences.edit().apply {
            remove(KEY_AUTH_TOKEN)
            remove(KEY_TOKEN_EXPIRATION)
            apply()
        }
    }
    
    override fun isTokenValid(): Boolean {
        val token = getToken()
        if (token.isNullOrEmpty()) {
            return false
        }
        
        // Check if token has expired
        val expiration = getTokenExpiration()
        if (expiration != null && System.currentTimeMillis() > expiration) {
            // Token has expired, clear it
            clearToken()
            return false
        }
        
        return true
    }
    
    override fun saveTokenExpiration(expirationTimeMillis: Long) {
        sharedPreferences.edit().apply {
            putLong(KEY_TOKEN_EXPIRATION, expirationTimeMillis)
            apply()
        }
    }
    
    override fun getTokenExpiration(): Long? {
        val expiration = sharedPreferences.getLong(KEY_TOKEN_EXPIRATION, -1L)
        return if (expiration == -1L) null else expiration
    }
}
