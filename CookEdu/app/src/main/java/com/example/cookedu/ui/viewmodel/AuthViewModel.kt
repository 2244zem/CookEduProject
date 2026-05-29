package com.example.cookedu.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cookedu.data.repository.AuthRepository
import com.example.cookedu.models.LoginRequest
import com.example.cookedu.models.RegisterRequest
import com.example.cookedu.models.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.util.regex.Pattern

sealed class AuthUiState {
    object Initial : AuthUiState()
    object Loading : AuthUiState()
    data class Success(val user: User) : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}

class AuthViewModel(private val repository: AuthRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Initial)
    val uiState: StateFlow<AuthUiState> = _uiState

    init {
        viewModelScope.launch {
            repository.getCurrentUser().collect { user ->
                if (user != null) {
                    _uiState.value = AuthUiState.Success(user)
                } else if (_uiState.value is AuthUiState.Success) {
                    _uiState.value = AuthUiState.Initial
                }
            }
        }
    }

    fun login(request: LoginRequest) {
        if (request.email.isBlank() || request.password.isBlank()) {
            _uiState.value = AuthUiState.Error("Email dan password tidak boleh kosong")
            return
        }
        if (!isValidEmail(request.email)) {
            _uiState.value = AuthUiState.Error("Invalid email format")
            return
        }
        if (request.password.length < 8) {
            _uiState.value = AuthUiState.Error("Password minimal 8 karakter")
            return
        }

        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = repository.login(request)
            result.onSuccess { user ->
                _uiState.value = AuthUiState.Success(user)
            }.onFailure { error ->
                _uiState.value = AuthUiState.Error(error.message ?: "Terjadi kesalahan")
            }
        }
    }

    fun register(request: RegisterRequest) {
        if (request.name.isBlank()) {
            _uiState.value = AuthUiState.Error("Name is required")
            return
        }
        if (request.email.isBlank() || request.password.isBlank()) {
            _uiState.value = AuthUiState.Error("Semua field wajib diisi")
            return
        }
        if (!isValidEmail(request.email)) {
            _uiState.value = AuthUiState.Error("Invalid email format")
            return
        }
        if (request.password.length < 8) {
            _uiState.value = AuthUiState.Error("Password minimal 8 karakter")
            return
        }
        if (request.password != request.passwordConfirmation) {
            _uiState.value = AuthUiState.Error("Konfirmasi password tidak cocok")
            return
        }

        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val result = repository.register(request)
            result.onSuccess { user ->
                _uiState.value = AuthUiState.Success(user)
            }.onFailure { error ->
                _uiState.value = AuthUiState.Error(error.message ?: "Terjadi kesalahan")
            }
        }
    }

    fun logout(onComplete: () -> Unit) {
        viewModelScope.launch {
            repository.logout()
            _uiState.value = AuthUiState.Initial
            onComplete()
        }
    }

    fun resetState() {
        _uiState.value = AuthUiState.Initial
    }

    private fun isValidEmail(email: String): Boolean {
        // Keep it simple; backend will do strict validation anyway.
        val pattern = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")
        return pattern.matcher(email.trim()).matches()
    }
}
