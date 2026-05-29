package com.example.cookedu.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cookedu.data.repository.AuthRepository
import com.example.cookedu.models.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class ProfileUiState {
    data object Idle : ProfileUiState()
    data object Loading : ProfileUiState()
    data class Success(val user: User) : ProfileUiState()
    data class Error(val message: String) : ProfileUiState()
}

class ProfileViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {
    private val _uiState = MutableStateFlow<ProfileUiState>(ProfileUiState.Idle)
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    fun loadProfile() {
        viewModelScope.launch {
            _uiState.value = ProfileUiState.Loading
            val result = authRepository.fetchProfile()
            _uiState.value = result.fold(
                onSuccess = { ProfileUiState.Success(it) },
                onFailure = { ProfileUiState.Error(it.message ?: "Gagal memuat profil") }
            )
        }
    }

    fun updateProfile(
        name: String?,
        phone: String?,
        avatarBytes: ByteArray? = null,
        avatarMimeType: String? = null,
        avatarFilename: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = ProfileUiState.Loading
            val result = authRepository.updateProfile(
                name = name,
                phone = phone,
                avatarBytes = avatarBytes,
                avatarMimeType = avatarMimeType,
                avatarFilename = avatarFilename
            )
            _uiState.value = result.fold(
                onSuccess = { ProfileUiState.Success(it) },
                onFailure = { ProfileUiState.Error(it.message ?: "Gagal update profil") }
            )
        }
    }
}

