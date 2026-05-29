package com.example.cookedu.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cookedu.R
import com.example.cookedu.ui.theme.Primary
import com.example.cookedu.ui.theme.PrimaryDark
import com.example.cookedu.ui.theme.SurfaceLight
import com.example.cookedu.ui.theme.TextSecondaryLight
import com.example.cookedu.ui.viewmodel.AiAssistantViewModel
import com.example.cookedu.ui.viewmodel.AiChatUiState
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun AiAssistantScreen(
    viewModel: AiAssistantViewModel,
    onNavigateBack: () -> Unit
) {
    val messages by viewModel.messages.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    
    var inputText by remember { mutableStateOf("") }
    val isTyping = uiState is AiChatUiState.Sending
    
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(messages.size, isTyping) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    val suggestions = listOf(
        "Resep Cuaca Hari Ini",
        "Panduan Langkah Masak",
        "Substitusi Bahan Kreatif"
    )

    fun handleSend(text: String) {
        if (text.isBlank() || isTyping) return
        inputText = ""
        viewModel.sendMessage(text)
    }

    Box(modifier = Modifier.fillMaxSize().background(SurfaceLight)) {
        Image(
            painter = painterResource(id = R.drawable.bg_food_drawing),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
            alpha = 0.08f
        )
        
        Column(modifier = Modifier.fillMaxSize()) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.8f))
                    .padding(top = 40.dp, bottom = 20.dp, start = 20.dp, end = 20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onNavigateBack,
                    modifier = Modifier.background(Color.White.copy(alpha = 0.8f), RoundedCornerShape(16.dp))
                ) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Primary)
                }
                Spacer(modifier = Modifier.width(16.dp))
                Box(
                    modifier = Modifier.size(48.dp).background(Brush.linearGradient(listOf(Primary, PrimaryDark)), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.SmartToy, contentDescription = null, tint = Color.White, modifier = Modifier.size(24.dp))
                }
                Spacer(modifier = Modifier.width(14.dp))
                Column {
                    Text("Chef AI Sous-Chef", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                    Text(if (isTyping) "Sedang mengetik..." else "Online • Siap Membantu", fontSize = 11.sp, color = Primary, fontWeight = FontWeight.SemiBold)
                }
            }
            
            if (uiState is AiChatUiState.Error) {
                Box(modifier = Modifier.fillMaxWidth().background(Color.Red.copy(alpha = 0.1f)).padding(8.dp), contentAlignment = Alignment.Center) {
                    Text((uiState as AiChatUiState.Error).message, color = Color.Red, fontSize = 12.sp)
                }
            }

            // Messages
            LazyColumn(
                state = listState,
                modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
                contentPadding = PaddingValues(vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(messages) { msg ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = if (msg.isUser) Arrangement.End else Arrangement.Start
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(0.85f)
                                .background(
                                    if (msg.isUser) Brush.linearGradient(listOf(Primary, PrimaryDark))
                                    else SolidColor(Color.White.copy(alpha = 0.95f)),
                                    RoundedCornerShape(
                                        topStart = 24.dp,
                                        topEnd = 24.dp,
                                        bottomStart = if (msg.isUser) 24.dp else 6.dp,
                                        bottomEnd = if (msg.isUser) 6.dp else 24.dp
                                    )
                                )
                                .padding(18.dp)
                        ) {
                            Text(
                                msg.text,
                                color = if (msg.isUser) Color.White else Color(0xFF0F172A),
                                fontSize = 14.sp,
                                lineHeight = 20.sp,
                                fontWeight = if (msg.isUser) FontWeight.Bold else FontWeight.Medium
                            )
                        }
                    }
                }
                if (isTyping) {
                    item {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Start) {
                            Box(
                                modifier = Modifier
                                    .background(Color.White.copy(alpha = 0.8f), RoundedCornerShape(24.dp))
                                    .padding(horizontal = 16.dp, vertical = 12.dp)
                            ) {
                                Text("Chef sedang mengetik...", fontSize = 12.sp, color = Color.Gray, fontStyle = androidx.compose.ui.text.font.FontStyle.Italic)
                            }
                        }
                    }
                }
            }
            
            // Suggestions & Input
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.7f))
                    .padding(bottom = 24.dp, top = 8.dp)
            ) {
                LazyRow(
                    modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(suggestions) { sugg ->
                        Box(
                            modifier = Modifier
                                .background(Color.White, RoundedCornerShape(20.dp))
                                .border(1.dp, Primary.copy(alpha = 0.2f), RoundedCornerShape(20.dp))
                                .clickable { handleSend(sugg) }
                                .padding(horizontal = 16.dp, vertical = 8.dp)
                        ) {
                            Text(sugg, color = Color(0xFF475569), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
                
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .background(Color.White, RoundedCornerShape(32.dp))
                        .border(1.dp, Primary.copy(alpha = 0.2f), RoundedCornerShape(32.dp))
                        .padding(start = 16.dp, end = 6.dp, top = 6.dp, bottom = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = { Text("Tanya Chef AI...", fontSize = 12.sp, color = TextSecondaryLight) },
                        modifier = Modifier.weight(1f),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                            focusedTextColor = Color(0xFF0F172A),
                            unfocusedTextColor = Color(0xFF0F172A)
                        ),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                        keyboardActions = KeyboardActions(onSend = { handleSend(inputText) })
                    )
                    IconButton(
                        onClick = { handleSend(inputText) },
                        enabled = !isTyping,
                        modifier = Modifier.size(40.dp).background(if (isTyping) SolidColor(Color.Gray) else Brush.linearGradient(listOf(Color(0xFF0EA5E9), Color(0xFF14B8A6))), CircleShape)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.Send, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
    }
}
