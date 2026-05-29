package com.example.cookedu.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cookedu.data.repository.AiAssistantRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class ChatMessage(
    val id: String,
    val text: String,
    val isUser: Boolean
)

sealed class AiChatUiState {
    object Idle : AiChatUiState()
    object Sending : AiChatUiState()
    data class Success(val reply: String) : AiChatUiState()
    data class Error(val message: String) : AiChatUiState()
}

class AiAssistantViewModel(private val repository: AiAssistantRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<AiChatUiState>(AiChatUiState.Idle)
    val uiState: StateFlow<AiChatUiState> = _uiState

    private val _messages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                "1",
                "Halo Kak! ☁️ ChefAI di sini. Resep apa yang ingin kita ulik hari ini? 🍳",
                false
            )
        )
    )
    val messages: StateFlow<List<ChatMessage>> = _messages

    fun sendMessage(text: String) {
        if (text.isBlank()) return

        val userMessage = ChatMessage(System.currentTimeMillis().toString(), text, true)
        _messages.value = _messages.value + userMessage

        viewModelScope.launch {
            _uiState.value = AiChatUiState.Sending
            
            // Format history for Gemini API
            val history = _messages.value.dropLast(1).map {
                mapOf(
                    "role" to if (it.isUser) "user" else "model",
                    "parts" to listOf(mapOf("text" to it.text))
                )
            }

            val result = repository.sendMessage(text, history)
            result.onSuccess { response ->
                _messages.value = _messages.value + ChatMessage(
                    (System.currentTimeMillis() + 1).toString(),
                    response.reply,
                    false
                )
                _uiState.value = AiChatUiState.Success(response.reply)
            }.onFailure { error ->
                _uiState.value = AiChatUiState.Error(error.message ?: "Gagal mengirim pesan")
            }
        }
    }
}
