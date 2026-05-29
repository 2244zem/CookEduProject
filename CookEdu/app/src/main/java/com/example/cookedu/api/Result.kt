package com.example.cookedu.api

/**
 * A generic wrapper class for API responses that represents either success or failure.
 * This sealed class provides type-safe error handling for API operations.
 *
 * @param T The type of data returned on success
 */
sealed class Result<out T> {
    /**
     * Represents a successful API response with data.
     * @param data The response data
     */
    data class Success<T>(val data: T) : Result<T>()
    
    /**
     * Represents a failed API response with an error message.
     * @param message The error message describing what went wrong
     * @param exception Optional exception that caused the failure
     */
    data class Failure(
        val message: String,
        val exception: Throwable? = null
    ) : Result<Nothing>()
    
    /**
     * Returns true if this is a Success result.
     */
    fun isSuccess(): Boolean = this is Success
    
    /**
     * Returns true if this is a Failure result.
     */
    fun isFailure(): Boolean = this is Failure
    
    /**
     * Returns the data if this is a Success, or null if this is a Failure.
     */
    fun getOrNull(): T? = when (this) {
        is Success -> data
        is Failure -> null
    }
    
    /**
     * Returns the data if this is a Success, or throws the exception if this is a Failure.
     */
    fun getOrThrow(): T = when (this) {
        is Success -> data
        is Failure -> throw exception ?: Exception(message)
    }
    
    /**
     * Returns the data if this is a Success, or the default value if this is a Failure.
     */
    fun getOrDefault(defaultValue: @UnsafeVariance T): T = when (this) {
        is Success -> data
        is Failure -> defaultValue
    }
    
    /**
     * Transforms the data if this is a Success, or returns the Failure unchanged.
     */
    inline fun <R> map(transform: (T) -> R): Result<R> = when (this) {
        is Success -> Success(transform(data))
        is Failure -> this
    }
    
    /**
     * Executes the given action if this is a Success.
     */
    inline fun onSuccess(action: (T) -> Unit): Result<T> {
        if (this is Success) {
            action(data)
        }
        return this
    }
    
    /**
     * Executes the given action if this is a Failure.
     */
    inline fun onFailure(action: (String, Throwable?) -> Unit): Result<T> {
        if (this is Failure) {
            action(message, exception)
        }
        return this
    }
}
