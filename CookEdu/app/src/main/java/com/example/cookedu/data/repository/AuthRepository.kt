package com.example.cookedu.data.repository

import com.example.cookedu.api.ApiService
import com.example.cookedu.data.EncryptedTokenManager
import com.example.cookedu.data.local.dao.UserDao
import com.example.cookedu.data.local.entities.UserEntity
import com.example.cookedu.models.LoginRequest
import com.example.cookedu.models.RegisterRequest
import com.example.cookedu.models.User
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.json.JSONObject
import retrofit2.HttpException
import java.io.IOException
import java.util.Locale

interface AuthRepository {
    suspend fun login(request: LoginRequest): Result<User>
    suspend fun register(request: RegisterRequest): Result<User>
    suspend fun logout(): Result<Unit>
    suspend fun fetchProfile(): Result<User>
    suspend fun updateProfile(
        name: String?,
        phone: String?,
        avatarBytes: ByteArray? = null,
        avatarMimeType: String? = null,
        avatarFilename: String? = null
    ): Result<User>
    fun getCurrentUser(): Flow<User?>
    fun isAuthenticated(): Boolean
}

class AuthRepositoryImpl(
    private val apiService: ApiService,
    private val tokenManager: EncryptedTokenManager,
    private val userDao: UserDao
) : AuthRepository {

    override suspend fun login(request: LoginRequest): Result<User> {
        return try {
            val response = apiService.login(request)
            if (response.isSuccessful) {
                response.body()?.let { body ->
                    tokenManager.saveToken(body.token)
                    saveUserToLocal(body.user)
                    Result.success(body.user)
                } ?: Result.failure(Exception("Login response body is empty"))
            } else {
                Result.failure(Exception(parseAuthErrorMessage(response.errorBody()?.string(), fallback = "Login failed")))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Please check your connection."))
        } catch (e: HttpException) {
            Result.failure(Exception("Server error (${e.code()})"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun register(request: RegisterRequest): Result<User> {
        return try {
            val response = apiService.register(request)
            if (response.isSuccessful) {
                response.body()?.let { body ->
                    tokenManager.saveToken(body.token)
                    saveUserToLocal(body.user)
                    Result.success(body.user)
                } ?: Result.failure(Exception("Register response body is empty"))
            } else {
                Result.failure(Exception(parseAuthErrorMessage(response.errorBody()?.string(), fallback = "Register failed")))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Please check your connection."))
        } catch (e: HttpException) {
            Result.failure(Exception("Server error (${e.code()})"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun logout(): Result<Unit> {
        return try {
            apiService.logout()
            tokenManager.clearToken()
            userDao.clearUsers()
            Result.success(Unit)
        } catch (e: Exception) {
            // Still clear local session even if API logout fails
            tokenManager.clearToken()
            userDao.clearUsers()
            Result.failure(e)
        }
    }

    override suspend fun fetchProfile(): Result<User> {
        return try {
            val response = apiService.getProfile()
            if (response.isSuccessful) {
                response.body()?.user?.let { user ->
                    saveUserToLocal(user)
                    Result.success(user)
                } ?: Result.failure(Exception("Profile response body is empty"))
            } else {
                Result.failure(Exception("Gagal memuat profil (${response.code()})"))
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Please check your connection."))
        } catch (e: HttpException) {
            Result.failure(Exception("Server error (${e.code()})"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateProfile(
        name: String?,
        phone: String?,
        avatarBytes: ByteArray?,
        avatarMimeType: String?,
        avatarFilename: String?
    ): Result<User> {
        return try {
            val methodBody = "PUT".toRequestBody("text/plain".toMediaTypeOrNull())
            val nameBody = name?.takeIf { it.isNotBlank() }?.toRequestBody("text/plain".toMediaTypeOrNull())
            val phoneBody = phone?.takeIf { it.isNotBlank() }?.toRequestBody("text/plain".toMediaTypeOrNull())

            val avatarPart: MultipartBody.Part? = if (avatarBytes != null && avatarBytes.isNotEmpty()) {
                val mime = (avatarMimeType ?: "image/*").toMediaTypeOrNull()
                val body: RequestBody = avatarBytes.toRequestBody(mime)
                MultipartBody.Part.createFormData(
                    "avatar",
                    avatarFilename ?: "avatar.jpg",
                    body
                )
            } else null

            val response = apiService.updateProfile(
                method = methodBody,
                name = nameBody,
                phone = phoneBody,
                avatar = avatarPart
            )
            if (response.isSuccessful) {
                response.body()?.user?.let { user ->
                    saveUserToLocal(user)
                    Result.success(user)
                } ?: Result.failure(Exception("Update profile response body is empty"))
            } else {
                Result.failure(
                    Exception(
                        parseAuthErrorMessage(
                            response.errorBody()?.string(),
                            fallback = "Gagal update profil (${response.code()})"
                        )
                    )
                )
            }
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Please check your connection."))
        } catch (e: HttpException) {
            Result.failure(Exception("Server error (${e.code()})"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun getCurrentUser(): Flow<User?> {
        return userDao.observeCurrentUser().map { entity ->
            entity?.let {
                User(
                    id = it.id,
                    name = it.name,
                    email = it.email,
                    role = it.role,
                    phone = it.phone,
                    xp = it.xp,
                    avatarUrl = it.avatarUrl,
                    createdAt = it.createdAt
                )
            }
        }
    }

    override fun isAuthenticated(): Boolean {
        return tokenManager.isTokenValid()
    }

    private suspend fun saveUserToLocal(user: User) {
        userDao.clearUsers()
        userDao.insertUser(
            UserEntity(
                id = user.id,
                name = user.name,
                email = user.email,
                xp = user.xp,
                role = user.role,
                phone = user.phone,
                avatarUrl = user.avatarUrl,
                createdAt = user.createdAt ?: ""
            )
        )
    }

    private fun parseAuthErrorMessage(errorBody: String?, fallback: String): String {
        val raw = (errorBody ?: "").trim()
        if (raw.isEmpty()) return fallback

        // Try parsing structured JSON errors first.
        try {
            val json = JSONObject(raw)
            val message = json.optString("message")
            if (message.isNotBlank()) {
                val lowerMessage = message.lowercase(Locale.ROOT)
                if (lowerMessage.contains("email") && (lowerMessage.contains("already") || lowerMessage.contains("taken") || lowerMessage.contains("terdaftar"))) {
                    return "Email sudah terdaftar. Silakan login."
                }
                if (lowerMessage.contains("credential")) {
                    return "Email atau password salah"
                }
                if (lowerMessage.contains("email") && (lowerMessage.contains("valid") || lowerMessage.contains("format"))) {
                    return "Invalid email format"
                }
            }

            val errors = json.optJSONObject("errors")
            if (errors != null) {
                val emailErrors = errors.optJSONArray("email")
                if (emailErrors != null && emailErrors.length() > 0) {
                    val firstEmailError = emailErrors.optString(0).lowercase(Locale.ROOT)
                    if (firstEmailError.contains("already") || firstEmailError.contains("taken") || firstEmailError.contains("terdaftar")) {
                        return "Email sudah terdaftar. Silakan login."
                    }
                    if (firstEmailError.contains("valid") || firstEmailError.contains("format")) {
                        return "Invalid email format"
                    }
                }

                val passwordErrors = errors.optJSONArray("password")
                if (passwordErrors != null && passwordErrors.length() > 0) {
                    return "Password must be at least 6 characters"
                }

                val nameErrors = errors.optJSONArray("name")
                if (nameErrors != null && nameErrors.length() > 0) {
                    return "Name is required"
                }
            }
        } catch (_: Exception) {
            // Ignore and continue with heuristic parsing.
        }

        // Heuristic parsing: backend commonly returns JSON with "message" and/or errors.
        val lower = raw.lowercase(Locale.ROOT)
        if (lower.contains("email") && (lower.contains("already") || lower.contains("taken") || lower.contains("terdaftar"))) {
            return "Email sudah terdaftar. Silakan login."
        }
        if (lower.contains("invalid") && lower.contains("credentials")) {
            return "Email atau password salah"
        }
        if (lower.contains("password") && (lower.contains("least") || lower.contains("minimal"))) {
            return "Password must be at least 6 characters"
        }
        if (lower.contains("name") && (lower.contains("required") || lower.contains("wajib"))) {
            return "Name is required"
        }
        if (lower.contains("email") && (lower.contains("valid") || lower.contains("format"))) {
            return "Invalid email format"
        }

        // Avoid dumping raw HTML to UI if server returns an HTML error page.
        if (lower.startsWith("<!doctype html") || lower.startsWith("<html")) {
            return fallback
        }
        return fallback
    }
}
