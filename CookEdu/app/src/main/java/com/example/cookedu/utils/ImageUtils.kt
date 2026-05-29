package com.example.cookedu.utils

import android.net.Uri
import android.content.Context
import com.example.cookedu.api.ApiClient
import java.util.Locale

object ImageUtils {
    /**
     * Menormalisasi URL gambar, menerjemahkan localhost/127.0.0.1 atau path relatif
     * ke Base URL API aktif yang tersimpan di SharedPreferences.
     */
    fun getNormalizedImageUrl(context: Context, url: String?): String? {
        if (url.isNullOrBlank()) return null

        val rawUrl = url.trim()
        val baseUrl = ApiClient.getBaseUrl(context).trim().trimEnd('/')

        val parseableUrl = when {
            rawUrl.startsWith("localhost", ignoreCase = true) -> "http://$rawUrl"
            rawUrl.startsWith("127.0.0.1", ignoreCase = true) -> "http://$rawUrl"
            rawUrl.startsWith("0.0.0.0", ignoreCase = true) -> "http://$rawUrl"
            else -> rawUrl
        }
        val parsed = runCatching { Uri.parse(parseableUrl) }.getOrNull()
        val scheme = parsed?.scheme?.lowercase(Locale.ROOT)

        if (scheme == "http" || scheme == "https") {
            val host = parsed.host?.lowercase(Locale.ROOT)
            if (host == "localhost" || host == "127.0.0.1" || host == "0.0.0.0" || host == "::1") {
                val path = parsed.encodedPath.orEmpty()
                val query = parsed.encodedQuery?.let { "?$it" }.orEmpty()
                return buildAbsoluteImageUrl(baseUrl, "$path$query")
            }
            return parseableUrl
        }

        if (rawUrl.startsWith("//")) {
            return "https:$rawUrl"
        }

        val firstPathSegment = rawUrl.substringBefore("/")
        if (!rawUrl.startsWith("/") && firstPathSegment.contains(".")) {
            return "https://$rawUrl"
        }

        return buildAbsoluteImageUrl(baseUrl, rawUrl)
    }

    private fun buildAbsoluteImageUrl(baseUrl: String, rawPath: String): String {
        val cleanPath = rawPath.trim().trimStart('/')
        if (cleanPath.isBlank()) return baseUrl

        val pathWithStorage = when {
            cleanPath.startsWith("storage/", ignoreCase = true) -> cleanPath
            cleanPath.startsWith("avatars/", ignoreCase = true) -> "storage/$cleanPath"
            cleanPath.startsWith("recipes/", ignoreCase = true) -> "storage/$cleanPath"
            else -> cleanPath
        }

        return "$baseUrl/$pathWithStorage"
    }
}
