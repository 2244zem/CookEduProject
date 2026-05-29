package com.example.cookedu.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.RestaurantMenu
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cookedu.R
import com.example.cookedu.ui.theme.Cyan100
import com.example.cookedu.ui.theme.Primary
import com.example.cookedu.ui.theme.PrimaryDark
import com.example.cookedu.ui.theme.TextSecondaryLight

private data class OnboardingPage(
    val icon: ImageVector,
    val title: String,
    val body: String
)

@Composable
fun OnboardingScreen(onFinished: () -> Unit) {
    val context = LocalContext.current
    var page by remember { mutableStateOf(0) }
    val pages = remember {
        listOf(
            OnboardingPage(Icons.Default.RestaurantMenu, "Masak tanpa bingung", "Ikuti resep dengan bahan, waktu, dan langkah yang jelas."),
            OnboardingPage(Icons.Default.MenuBook, "Belajar teknik dasar", "Bangun kebiasaan memasak dari prep, potong, tumis, sampai plating."),
            OnboardingPage(Icons.Default.AutoAwesome, "Buka resep dari mana saja", "Bagikan link CookEdu dan langsung lanjutkan di aplikasi.")
        )
    }

    fun finish() {
        context.getSharedPreferences("COOKEDU_PREFS", android.content.Context.MODE_PRIVATE)
            .edit()
            .putBoolean("ONBOARDING_DONE", true)
            .apply()
        onFinished()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFFEFF6FF), Color.White)))
            .padding(24.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(28.dp))
            Box(
                modifier = Modifier
                    .size(108.dp)
                    .clip(RoundedCornerShape(34.dp))
                    .background(Color.White)
                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(34.dp)),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.app_logo_mark),
                    contentDescription = null,
                    modifier = Modifier.size(90.dp)
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(290.dp)
                    .clip(RoundedCornerShape(42.dp))
                    .background(Brush.verticalGradient(listOf(Primary, PrimaryDark)))
                    .border(1.dp, Color.White.copy(alpha = 0.5f), RoundedCornerShape(42.dp)),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .offset(x = 110.dp, y = (-95).dp)
                        .size(136.dp)
                        .clip(RoundedCornerShape(42.dp))
                        .background(Color.White.copy(alpha = 0.14f))
                )
                Box(
                    modifier = Modifier
                        .offset(x = (-110).dp, y = 95.dp)
                        .size(100.dp)
                        .clip(RoundedCornerShape(34.dp))
                        .background(Color(0xFFFDE68A).copy(alpha = 0.76f))
                )
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(
                        modifier = Modifier
                            .size(96.dp)
                            .clip(RoundedCornerShape(30.dp))
                            .background(Color.White),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(pages[page].icon, contentDescription = null, tint = Primary, modifier = Modifier.size(46.dp))
                    }
                    Spacer(modifier = Modifier.height(20.dp))
                    Text(
                        pages[page].title,
                        color = Color.White,
                        fontSize = 25.sp,
                        fontWeight = FontWeight.Black,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        pages[page].body,
                        color = Color.White.copy(alpha = 0.82f),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 26.dp),
                        lineHeight = 20.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(22.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                pages.indices.forEach { index ->
                    Box(
                        modifier = Modifier
                            .width(if (index == page) 28.dp else 9.dp)
                            .height(9.dp)
                            .clip(RoundedCornerShape(99.dp))
                            .background(if (index == page) Primary else Cyan100)
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Button(
                onClick = {
                    if (page == pages.lastIndex) finish() else page += 1
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(58.dp),
                shape = RoundedCornerShape(22.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Primary)
            ) {
                Text(if (page == pages.lastIndex) "Mulai sekarang" else "Lanjut", color = Color.White, fontWeight = FontWeight.Black)
            }
            TextButton(onClick = { finish() }) {
                Text("Lewati", color = TextSecondaryLight, fontWeight = FontWeight.Bold)
            }
        }
    }
}
