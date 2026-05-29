package com.example.cookedu.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cookedu.R
import com.example.cookedu.api.ApiClient
import com.example.cookedu.models.LoginRequest
import com.example.cookedu.ui.theme.Primary
import com.example.cookedu.ui.theme.PrimaryDark
import com.example.cookedu.ui.theme.SurfaceLight
import com.example.cookedu.ui.theme.TextSecondaryLight
import com.example.cookedu.ui.theme.Danger
import com.example.cookedu.ui.viewmodel.AuthUiState
import com.example.cookedu.ui.viewmodel.AuthViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onNavigateToDashboard: () -> Unit, 
    onNavigateToRegister: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPass by remember { mutableStateOf(false) }
    var showSettingsDialog by remember { mutableStateOf(false) }
    var apiUrlInput by remember { mutableStateOf("") }
    
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(uiState) {
        if (uiState is AuthUiState.Success) {
            viewModel.resetState()
            onNavigateToDashboard()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        // Ethereal Background - Matching Web Frontend
        Image(
            painter = painterResource(id = R.drawable.bg_main),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxSize()
                .blur(12.dp),
            alpha = 0.15f
        )
        
        // Gradient overlay matching web design
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.linearGradient(
                        colors = listOf(
                            Primary.copy(alpha = 0.08f),
                            SurfaceLight.copy(alpha = 0.7f),
                            Primary.copy(alpha = 0.08f)
                        )
                    )
                )
        )

        // Wave top section - More organic like web frontend
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(380.dp)
                .clip(RoundedCornerShape(bottomStart = 120.dp, bottomEnd = 120.dp))
                .background(
                    Brush.linearGradient(
                        colors = listOf(Primary, PrimaryDark)
                    )
                )
        ) {
            Image(
                painter = painterResource(id = R.drawable.bg_food_drawing),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
                alpha = 0.15f
            )
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(108.dp)
                        .background(Color.White, RoundedCornerShape(34.dp))
                        .border(2.dp, Color.White.copy(alpha = 0.75f), RoundedCornerShape(34.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.app_logo_mark),
                        contentDescription = null,
                        modifier = Modifier.size(92.dp)
                    )
                }
                Spacer(modifier = Modifier.height(20.dp))
                Text("CookEdu", color = Color.White, fontSize = 42.sp, fontWeight = FontWeight.Black, letterSpacing = (-0.5).sp)
                Text("BELAJAR MASAK LEBIH RAPI", color = Color.White.copy(alpha = 0.9f), fontSize = 11.sp, letterSpacing = 2.sp, fontWeight = FontWeight.Medium)
            }
            
            // Settings Button
            IconButton(
                onClick = {
                    apiUrlInput = ApiClient.getBaseUrl(context)
                    showSettingsDialog = true 
                },
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 48.dp, end = 20.dp)
                    .background(Color.White.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
            ) {
                Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color.White)
            }
        }

        // Glassmorphism Form - Improved to match web frontend
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 320.dp, start = 24.dp, end = 24.dp)
                .verticalScroll(rememberScrollState())
                .imePadding(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.5f), RoundedCornerShape(40.dp))
                    .border(1.5.dp, Color.White.copy(alpha = 0.7f), RoundedCornerShape(40.dp))
                    .padding(36.dp)
            ) {
                Column {
                    Text("Selamat Datang Kembali", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                    Text("Mari lanjutkan perjalanan kulinermu dengan santai", fontSize = 14.sp, color = TextSecondaryLight, modifier = Modifier.padding(top = 8.dp, bottom = 28.dp))

                    if (uiState is AuthUiState.Error) {
                        val error = (uiState as AuthUiState.Error).message
                        Text(
                            text = error,
                            color = Danger,
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    Danger.copy(alpha = 0.1f),
                                    RoundedCornerShape(20.dp)
                                )
                                .padding(16.dp),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(20.dp))
                    }

                    Text("Email", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = TextSecondaryLight, modifier = Modifier.padding(start = 20.dp, bottom = 8.dp))
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        placeholder = { Text("contoh@email.com", fontSize = 14.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(24.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = Color.White.copy(alpha = 0.8f),
                            focusedContainerColor = Color.White,
                            unfocusedBorderColor = Color.White.copy(alpha = 0.5f),
                            focusedBorderColor = Primary.copy(alpha = 0.5f),
                            unfocusedTextColor = Color(0xFF0F172A),
                            focusedTextColor = Color(0xFF0F172A),
                            unfocusedPlaceholderColor = Color(0xFF64748B),
                            focusedPlaceholderColor = Color(0xFF64748B)
                        ),
                        trailingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = Color.Gray) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text("Kata Sandi", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = TextSecondaryLight, modifier = Modifier.padding(start = 20.dp, bottom = 8.dp))
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        placeholder = { Text("Masukkan kata sandi", fontSize = 14.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(24.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = Color.White.copy(alpha = 0.8f),
                            focusedContainerColor = Color.White,
                            unfocusedBorderColor = Color.White.copy(alpha = 0.5f),
                            focusedBorderColor = Primary.copy(alpha = 0.5f),
                            unfocusedTextColor = Color(0xFF0F172A),
                            focusedTextColor = Color(0xFF0F172A),
                            unfocusedPlaceholderColor = Color(0xFF64748B),
                            focusedPlaceholderColor = Color(0xFF64748B)
                        ),
                        visualTransformation = if (showPass) VisualTransformation.None else PasswordVisualTransformation(),
                        trailingIcon = {
                            IconButton(onClick = { showPass = !showPass }) {
                                Icon(if (showPass) Icons.Default.VisibilityOff else Icons.Default.Visibility, contentDescription = null, tint = TextSecondaryLight)
                            }
                        },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                    )

                    Spacer(modifier = Modifier.height(36.dp))

                    val isLoading = uiState is AuthUiState.Loading

                    Button(
                        onClick = {
                            viewModel.login(LoginRequest(email, password))
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(24.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Primary,
                            contentColor = Color.White
                        ),
                        enabled = !isLoading,
                        elevation = ButtonDefaults.buttonElevation(
                            defaultElevation = 0.dp,
                            pressedElevation = 0.dp
                        )
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                        } else {
                            Text("MASUK", fontWeight = FontWeight.Bold, fontSize = 15.sp, letterSpacing = 1.sp)
                        }
                    }
                    Spacer(modifier = Modifier.height(28.dp))
                    TextButton(
                        onClick = onNavigateToRegister,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Belum punya akun? Buat Akun Baru", color = Primary, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
        }

        if (showSettingsDialog) {
            AlertDialog(
                onDismissRequest = { showSettingsDialog = false },
                title = { Text("Pengaturan Server API") },
                text = {
                    Column {
                        Text("Masukkan URL Backend (Railway) Anda:")
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = apiUrlInput,
                            onValueChange = { apiUrlInput = it },
                            placeholder = { Text("https://xxx.up.railway.app/") }
                        )
                    }
                },
                confirmButton = {
                    TextButton(onClick = {
                        val finalUrl = ApiClient.normalizeBaseUrl(apiUrlInput)
                        context.getSharedPreferences("COOKEDU_PREFS", android.content.Context.MODE_PRIVATE)
                            .edit().putString("API_BASE_URL", finalUrl).apply()
                        showSettingsDialog = false
                    }) {
                        Text("Simpan")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showSettingsDialog = false }) {
                        Text("Batal")
                    }
                }
            )
        }
    }
}
