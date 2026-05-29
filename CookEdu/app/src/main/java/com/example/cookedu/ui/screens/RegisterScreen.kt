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
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cookedu.R
import com.example.cookedu.models.RegisterRequest
import com.example.cookedu.ui.theme.Primary
import com.example.cookedu.ui.theme.PrimaryDark
import com.example.cookedu.ui.viewmodel.AuthUiState
import com.example.cookedu.ui.viewmodel.AuthViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    viewModel: AuthViewModel,
    onNavigateToLogin: () -> Unit, 
    onNavigateToDashboard: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordConfirm by remember { mutableStateOf("") }
    var showPass by remember { mutableStateOf(false) }
    
    val uiState by viewModel.uiState.collectAsState()

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
        // Ethereal Background
        Image(
            painter = painterResource(id = R.drawable.bg_main),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxSize()
                .blur(8.dp),
            alpha = 0.2f
        )
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.linearGradient(
                        colors = listOf(
                            Primary.copy(alpha = 0.05f),
                            Color(0xFFF8FAFC).copy(alpha = 0.6f),
                            Primary.copy(alpha = 0.05f)
                        )
                    )
                )
        )

        // Wave top section
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(280.dp)
                .clip(RoundedCornerShape(bottomStart = 100.dp, bottomEnd = 100.dp))
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
                alpha = 0.2f
            )
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(82.dp)
                        .background(Color.White, RoundedCornerShape(28.dp))
                        .border(1.dp, Color.White.copy(alpha = 0.75f), RoundedCornerShape(28.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.app_logo_mark),
                        contentDescription = null,
                        modifier = Modifier.size(68.dp)
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text("Mulai dari dapurmu", color = Color.White, fontSize = 31.sp, fontWeight = FontWeight.Bold)
                Text("RESEP, TEKNIK, DAN RITME BELAJAR", color = Color.White.copy(alpha = 0.9f), fontSize = 11.sp, letterSpacing = 1.6.sp, fontWeight = FontWeight.Medium)
            }
        }

        // Glassmorphism Form
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 230.dp, start = 24.dp, end = 24.dp)
                .verticalScroll(rememberScrollState())
                .imePadding(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.5f), RoundedCornerShape(40.dp))
                    .border(1.dp, Color.White.copy(alpha = 0.8f), RoundedCornerShape(40.dp))
                    .padding(32.dp)
            ) {
                Column {
                    if (uiState is AuthUiState.Error) {
                        val error = (uiState as AuthUiState.Error).message
                        Text(
                            text = error,
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.95f),
                                    RoundedCornerShape(20.dp)
                                )
                                .padding(16.dp),
                            fontSize = 13.sp
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    // Name
                    Text("Nama Lengkap", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.Gray, modifier = Modifier.padding(start = 20.dp, bottom = 8.dp))
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        placeholder = { Text("John Doe") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(24.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = Color.White.copy(alpha = 0.7f),
                            focusedContainerColor = Color.White.copy(alpha = 0.7f),
                            unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
                            focusedBorderColor = Primary.copy(alpha = 0.35f),
                            unfocusedTextColor = Color(0xFF0F172A),
                            focusedTextColor = Color(0xFF0F172A),
                            unfocusedPlaceholderColor = Color(0xFF64748B),
                            focusedPlaceholderColor = Color(0xFF64748B)
                        ),
                        trailingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = Color.Gray) }
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    // Email
                    Text("Email Address", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.Gray, modifier = Modifier.padding(start = 20.dp, bottom = 8.dp))
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        placeholder = { Text("nama@email.com") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(24.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = Color.White.copy(alpha = 0.7f),
                            focusedContainerColor = Color.White.copy(alpha = 0.7f),
                            unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
                            focusedBorderColor = Primary.copy(alpha = 0.35f),
                            unfocusedTextColor = Color(0xFF0F172A),
                            focusedTextColor = Color(0xFF0F172A),
                            unfocusedPlaceholderColor = Color(0xFF64748B),
                            focusedPlaceholderColor = Color(0xFF64748B)
                        ),
                        trailingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = Color.Gray) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    // Phone
                    Text("Phone Number", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.Gray, modifier = Modifier.padding(start = 20.dp, bottom = 8.dp))
                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        placeholder = { Text("08xxxxxxxxxx") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(24.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = Color.White.copy(alpha = 0.7f),
                            focusedContainerColor = Color.White.copy(alpha = 0.7f),
                            unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
                            focusedBorderColor = Primary.copy(alpha = 0.35f),
                            unfocusedTextColor = Color(0xFF0F172A),
                            focusedTextColor = Color(0xFF0F172A),
                            unfocusedPlaceholderColor = Color(0xFF64748B),
                            focusedPlaceholderColor = Color(0xFF64748B)
                        ),
                        trailingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = Color.Gray) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                    )
                    Spacer(modifier = Modifier.height(16.dp))

                    // Password
                    Text("Kata Sandi", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.Gray, modifier = Modifier.padding(start = 20.dp, bottom = 8.dp))
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        placeholder = { Text("Minimal 6 karakter") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(24.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = Color.White.copy(alpha = 0.7f),
                            focusedContainerColor = Color.White.copy(alpha = 0.7f),
                            unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
                            focusedBorderColor = Primary.copy(alpha = 0.35f),
                            unfocusedTextColor = Color(0xFF0F172A),
                            focusedTextColor = Color(0xFF0F172A),
                            unfocusedPlaceholderColor = Color(0xFF64748B),
                            focusedPlaceholderColor = Color(0xFF64748B)
                        ),
                        visualTransformation = if (showPass) VisualTransformation.None else PasswordVisualTransformation(),
                        trailingIcon = {
                            IconButton(onClick = { showPass = !showPass }) {
                                Icon(if (showPass) Icons.Default.VisibilityOff else Icons.Default.Visibility, contentDescription = null, tint = Color.Gray)
                            }
                        },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Confirm Password
                    Text("Ulangi Kata Sandi", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.Gray, modifier = Modifier.padding(start = 20.dp, bottom = 8.dp))
                    OutlinedTextField(
                        value = passwordConfirm,
                        onValueChange = { passwordConfirm = it },
                        placeholder = { Text("Masukkan kembali kata sandi") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(24.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = Color.White.copy(alpha = 0.7f),
                            focusedContainerColor = Color.White.copy(alpha = 0.7f),
                            unfocusedBorderColor = Color.White.copy(alpha = 0.1f),
                            focusedBorderColor = Primary.copy(alpha = 0.35f),
                            unfocusedTextColor = Color(0xFF0F172A),
                            focusedTextColor = Color(0xFF0F172A),
                            unfocusedPlaceholderColor = Color(0xFF64748B),
                            focusedPlaceholderColor = Color(0xFF64748B)
                        ),
                        visualTransformation = PasswordVisualTransformation(),
                        trailingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = Color.Gray) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    val isLoading = uiState is AuthUiState.Loading

                    Button(
                        onClick = {
                            viewModel.register(RegisterRequest(name, email, password, passwordConfirm, phone))
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(55.dp),
                        shape = RoundedCornerShape(24.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Primary),
                        enabled = !isLoading
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                        } else {
                            Text("Buat Akun Saya", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                    TextButton(
                        onClick = onNavigateToLogin,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Sudah memiliki akses? Masuk di Sini", color = Primary, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
