package com.example.cookedu.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.RestaurantMenu
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cookedu.R
import com.example.cookedu.data.EncryptedTokenManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.async

@Composable
fun SplashScreen(onNavigateToNext: (String) -> Unit) {
    val context = LocalContext.current
    var startAnimation by remember { mutableStateOf(false) }

    val alphaAnim = animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0f,
        animationSpec = tween(durationMillis = 800),
        label = "alpha"
    )

    val scaleAnim = animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0.5f,
        animationSpec = tween(durationMillis = 800),
        label = "scale"
    )

    val progressAnim = animateFloatAsState(
        targetValue = if (startAnimation) 1f else 0f,
        animationSpec = tween(durationMillis = 2000, easing = LinearEasing),
        label = "progress"
    )

    LaunchedEffect(key1 = true) {
        val authCheck = async {
            val tokenManager = EncryptedTokenManager(context)
            tokenManager.isTokenValid()
        }
        val onboardingDone = context
            .getSharedPreferences("COOKEDU_PREFS", android.content.Context.MODE_PRIVATE)
            .getBoolean("ONBOARDING_DONE", false)
        startAnimation = true
        // Requirements: minimum 2000ms splash duration
        delay(2000)

        if (authCheck.await()) {
            onNavigateToNext("dashboard")
        } else if (!onboardingDone) {
            onNavigateToNext("onboarding")
        } else {
            onNavigateToNext("login")
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFFEFF6FF), Color(0xFFF8FAFC), Color.White)
                )
            ),
    ) {
        Image(
            painter = painterResource(id = R.drawable.bg_food_drawing),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
            alpha = 0.06f
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.48f)
                .align(Alignment.BottomCenter)
                .clip(RoundedCornerShape(topStart = 46.dp, topEnd = 46.dp))
                .background(
                    Brush.verticalGradient(
                        listOf(Color(0xFF2563EB), Color(0xFF1D4ED8))
                    )
                )
        )

        Box(
            modifier = Modifier
                .offset(x = (-34).dp, y = 114.dp)
                .size(92.dp)
                .clip(RoundedCornerShape(30.dp))
                .background(Color(0xFFFDE68A).copy(alpha = 0.75f))
                .align(Alignment.TopEnd)
        )

        Box(
            modifier = Modifier
                .offset(x = 26.dp, y = 330.dp)
                .size(62.dp)
                .clip(RoundedCornerShape(22.dp))
                .background(Color(0xFFBAE6FD).copy(alpha = 0.8f))
                .align(Alignment.TopStart)
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 28.dp)
                .alpha(alphaAnim.value),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.weight(0.22f))

            Box(
                modifier = Modifier
                    .scale(scaleAnim.value)
                    .size(150.dp)
                    .clip(RoundedCornerShape(42.dp))
                    .background(Color.White)
                    .border(1.dp, Color.White, RoundedCornerShape(42.dp)),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.app_logo_mark),
                    contentDescription = null,
                    modifier = Modifier.size(126.dp)
                )
            }

            Spacer(modifier = Modifier.height(22.dp))
            Text(
                text = "CookEdu",
                color = Color(0xFF1D4ED8),
                fontSize = 40.sp,
                fontWeight = FontWeight.Black
            )
            Text(
                text = "Belajar masak dengan ritme yang lebih rapi.",
                color = Color(0xFF475569),
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )

            Spacer(modifier = Modifier.weight(0.32f))

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(30.dp))
                    .background(Color.White.copy(alpha = 0.94f))
                    .border(1.dp, Color.White, RoundedCornerShape(30.dp))
                    .padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                SplashFeatureRow(Icons.Default.RestaurantMenu, "Resep siap dipraktikkan", "Langkahnya singkat dan terstruktur.")
                SplashFeatureRow(Icons.Default.MenuBook, "Belajar teknik dasar", "Dari prep sampai plating.")
                SplashFeatureRow(Icons.Default.AutoAwesome, "Rekomendasi pintar", "Ide masak dari bahan yang ada.")

                LinearProgressIndicator(
                    progress = { progressAnim.value },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(7.dp)
                        .clip(RoundedCornerShape(99.dp)),
                    color = Color(0xFF2563EB),
                    trackColor = Color(0xFFDBEAFE)
                )
            }

            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}

@Composable
private fun SplashFeatureRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String
) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(42.dp)
                .clip(RoundedCornerShape(15.dp))
                .background(Color(0xFFEFF6FF)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = Color(0xFF2563EB), modifier = Modifier.size(20.dp))
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(title, color = Color(0xFF0F172A), fontSize = 13.sp, fontWeight = FontWeight.Black)
            Text(subtitle, color = Color(0xFF64748B), fontSize = 11.sp, fontWeight = FontWeight.Medium)
        }
    }
}
