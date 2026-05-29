package com.example.cookedu.api

import android.content.Context
import com.example.cookedu.data.EncryptedTokenManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    private const val DEFAULT_BASE_URL = "https://cookeduproject-production.up.railway.app/"

    fun normalizeBaseUrl(rawUrl: String?): String {
        var url = rawUrl?.trim().orEmpty()
        if (url.isBlank()) url = DEFAULT_BASE_URL

        if (!url.startsWith("http://", ignoreCase = true) &&
            !url.startsWith("https://", ignoreCase = true)
        ) {
            url = "https://$url"
        }

        url = url.trimEnd('/')
        if (url.endsWith("/api", ignoreCase = true)) {
            url = url.dropLast("/api".length)
        }

        return "$url/"
    }

    fun getBaseUrl(context: Context): String {
        val prefs = context.getSharedPreferences("COOKEDU_PREFS", Context.MODE_PRIVATE)
        val saved = prefs.getString("API_BASE_URL", null)?.trim().orEmpty()
        return normalizeBaseUrl(saved)
    }

    fun getService(context: Context): ApiService {
        val baseUrl = getBaseUrl(context)
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val authInterceptor = Interceptor { chain ->
            val req = chain.request()
            val tokenManager = EncryptedTokenManager(context)
            val token = tokenManager.getToken()
            
            val requestHeaders = req.newBuilder()
                .addHeader("Accept", "application/json")
            
            if (!token.isNullOrEmpty()) {
                requestHeaders.addHeader("Authorization", "Bearer $token")
            }
            
            chain.proceed(requestHeaders.build())
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .addInterceptor(authInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .client(client)
            .build()

        return retrofit.create(ApiService::class.java)
    }
}
