package com.example.cookedu.utils

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import retrofit2.HttpException
import java.io.IOException
import java.net.SocketTimeoutException

object NetworkUtils {

    fun isNetworkAvailable(context: Context): Boolean {
        val connectivityManager =
            context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        
        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false

        return capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
               capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
               capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
    }

    fun getErrorMessage(e: Exception): String {
        return when (e) {
            is SocketTimeoutException -> "Connection timeout. Please try again."
            is IOException -> "Network error. Please check your connection."
            is HttpException -> {
                when (e.code()) {
                    401 -> "Unauthorized. Please login again."
                    404 -> "Resource not found."
                    429 -> "Too many requests. Please wait a moment."
                    500 -> "Server error. Please try again later."
                    else -> "An unexpected network error occurred."
                }
            }
            else -> e.message ?: "An unexpected error occurred."
        }
    }
}
