package com.example.cookedu.ui.screens

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import coil.compose.AsyncImage
import com.example.cookedu.utils.ImageUtils
import com.example.cookedu.ui.theme.Primary
import com.example.cookedu.ui.theme.PrimaryDark
import com.example.cookedu.ui.theme.PrimaryLight
import com.example.cookedu.ui.theme.SurfaceLight
import com.example.cookedu.ui.theme.TextSecondaryLight
import com.example.cookedu.ui.viewmodel.ProfileUiState
import com.example.cookedu.ui.viewmodel.ProfileViewModel

@Composable
fun ProfileScreen(
    profileViewModel: ProfileViewModel,
    authViewModel: com.example.cookedu.ui.viewmodel.AuthViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToLogin: () -> Unit = {}
) {
    val context = LocalContext.current
    val profileState by profileViewModel.uiState.collectAsState()
    var showEditDialog by remember { mutableStateOf(false) }
    var currentUser by remember { mutableStateOf<com.example.cookedu.models.User?>(null) }
    var pendingAvatarBytes by remember { mutableStateOf<ByteArray?>(null) }
    var pendingAvatarMime by remember { mutableStateOf<String?>(null) }
    var pendingAvatarFilename by remember { mutableStateOf<String?>(null) }

    val pickImageLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            val imageBytes = context.contentResolver.openInputStream(uri)?.use { input ->
                val originalBytes = input.readBytes()
                val bitmap = BitmapFactory.decodeByteArray(originalBytes, 0, originalBytes.size)
                if (bitmap != null) {
                    // Backend accepts jpeg/png/jpg/gif; normalize to JPEG for consistency.
                    java.io.ByteArrayOutputStream().use { output ->
                        bitmap.compress(Bitmap.CompressFormat.JPEG, 90, output)
                        output.toByteArray()
                    }
                } else {
                    null
                }
            }

            if (imageBytes != null) {
                pendingAvatarBytes = imageBytes
                pendingAvatarMime = "image/jpeg"
                pendingAvatarFilename = "avatar_${System.currentTimeMillis()}.jpg"
                showEditDialog = true
            }
        }
    }

    LaunchedEffect(Unit) {
        profileViewModel.loadProfile()
    }

    LaunchedEffect(profileState) {
        val successState = profileState as? ProfileUiState.Success
        if (successState != null) {
            currentUser = successState.user
        }
    }
    
    val bgGradient = Brush.verticalGradient(
        colors = listOf(
            Color(0xFFEFF6FF),
            SurfaceLight,
            Color.White
        )
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgGradient)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .background(Color.White, RoundedCornerShape(14.dp))
                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(14.dp))
                    .size(42.dp)
            ) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = null,
                    tint = Primary
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(
                    "Profil",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF0F172A)
                )
                Text(
                    "Kelola informasi akun",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = TextSecondaryLight
                )
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        when (val state = profileState) {
            is ProfileUiState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Primary)
                }
            }
            is ProfileUiState.Success -> {
                val user = state.user

                ProfileDashboardContent(
                    user = user,
                    onEditProfile = { showEditDialog = true },
                    onChangeAvatar = { pickImageLauncher.launch("image/*") },
                    onLogout = {
                        authViewModel.logout {
                            onNavigateToLogin()
                        }
                    }
                )

            }
            is ProfileUiState.Error -> {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .background(Primary.copy(alpha = 0.1f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = null,
                            tint = Primary,
                            modifier = Modifier.size(36.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(20.dp))
                    Text(
                        "Gagal memuat profil",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        state.message,
                        fontSize = 13.sp,
                        color = Color(0xFF64748B),
                        modifier = Modifier.padding(horizontal = 16.dp),
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = { profileViewModel.loadProfile() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .shadow(4.dp, RoundedCornerShape(25.dp)),
                        shape = RoundedCornerShape(25.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Primary)
                    ) {
                        Text(
                            "Coba Lagi",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = Color.White
                        )
                    }
                }
            }
            else -> Unit
        }
    }
    
    // Edit Profile Dialog
    if (showEditDialog && currentUser != null) {
        EditProfileDialog(
            user = currentUser!!,
            hasPendingAvatar = pendingAvatarBytes != null,
            onDismiss = { 
                showEditDialog = false
                pendingAvatarBytes = null
                pendingAvatarMime = null
                pendingAvatarFilename = null
            },
            onSave = { name, phone ->
                profileViewModel.updateProfile(
                    name = name,
                    phone = phone,
                    avatarBytes = pendingAvatarBytes,
                    avatarMimeType = pendingAvatarMime,
                    avatarFilename = pendingAvatarFilename
                )
                showEditDialog = false
                pendingAvatarBytes = null
                pendingAvatarMime = null
                pendingAvatarFilename = null
            }
        )
    }
}

@Composable
private fun ProfileDashboardContent(
    user: com.example.cookedu.models.User,
    onEditProfile: () -> Unit,
    onChangeAvatar: () -> Unit,
    onLogout: () -> Unit
) {
    val normalizedAvatarUrl = ImageUtils.getNormalizedImageUrl(LocalContext.current, user.avatarUrl)
    val xpProgress = ((user.xp % 100).toFloat() / 100f).coerceIn(0.08f, 1f)
    val xpToNext = 100 - (user.xp % 100)
    val roleLabel = user.role?.replaceFirstChar { it.uppercase() } ?: "User"

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(bottom = 104.dp)
    ) {
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(292.dp)
                    .clip(RoundedCornerShape(34.dp))
                    .background(Brush.verticalGradient(listOf(PrimaryDark, Primary)))
                    .border(1.dp, Color.White.copy(alpha = 0.48f), RoundedCornerShape(34.dp))
            ) {
                Box(
                    modifier = Modifier
                        .offset(x = 178.dp, y = (-34).dp)
                        .size(148.dp)
                        .clip(RoundedCornerShape(48.dp))
                        .background(PrimaryLight.copy(alpha = 0.25f))
                )
                Box(
                    modifier = Modifier
                        .offset(x = (-36).dp, y = 190.dp)
                        .size(118.dp)
                        .clip(RoundedCornerShape(40.dp))
                        .background(Color(0xFFFDE68A).copy(alpha = 0.76f))
                )

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(22.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("CookEdu ID", fontSize = 12.sp, color = Color(0xFFBAE6FD), fontWeight = FontWeight.Black)
                            Text("Profil aktif", fontSize = 22.sp, color = Color.White, fontWeight = FontWeight.Black)
                        }
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color.White.copy(alpha = 0.16f))
                                .border(1.dp, Color.White.copy(alpha = 0.24f), RoundedCornerShape(16.dp))
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Text(roleLabel, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Black)
                        }
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    Row(verticalAlignment = Alignment.Bottom) {
                        Box(contentAlignment = Alignment.BottomEnd) {
                            Box(
                                modifier = Modifier
                                    .size(106.dp)
                                    .clip(RoundedCornerShape(30.dp))
                                    .background(Color(0xFFEFF6FF))
                                    .border(4.dp, Color.White, RoundedCornerShape(30.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                if (!normalizedAvatarUrl.isNullOrBlank()) {
                                    AsyncImage(
                                        model = normalizedAvatarUrl,
                                        contentDescription = null,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                } else {
                                    Text(
                                        user.name.take(1).uppercase(),
                                        fontSize = 40.sp,
                                        fontWeight = FontWeight.Black,
                                        color = PrimaryDark
                                    )
                                }
                            }

                            IconButton(
                                onClick = onChangeAvatar,
                                modifier = Modifier
                                    .size(36.dp)
                                    .background(Color.White, RoundedCornerShape(14.dp))
                                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(14.dp))
                            ) {
                                Icon(Icons.Default.CameraAlt, contentDescription = null, tint = Primary, modifier = Modifier.size(18.dp))
                            }
                        }

                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                user.name,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                user.email,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color.White.copy(alpha = 0.74f),
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            LinearProgressIndicator(
                                progress = { xpProgress },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(8.dp)
                                    .clip(RoundedCornerShape(99.dp)),
                                color = Color.White,
                                trackColor = Color.White.copy(alpha = 0.24f)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                "$xpToNext XP lagi untuk milestone berikutnya",
                                fontSize = 11.sp,
                                color = Color.White.copy(alpha = 0.84f),
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ProfileTinyAction(Icons.Default.Edit, "Edit", Modifier.weight(1f), onEditProfile)
                ProfileTinyAction(Icons.Default.Image, "Foto", Modifier.weight(1f), onChangeAvatar)
                ProfileTinyAction(Icons.AutoMirrored.Filled.ExitToApp, "Keluar", Modifier.weight(1f), onLogout, isDanger = true)
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ProfileStatTile("XP", user.xp.toString(), Icons.Default.Bolt, Modifier.weight(1f))
                ProfileStatTile("Progress", "${(xpProgress * 100).toInt()}%", Icons.Default.TrendingUp, Modifier.weight(1f))
            }
        }

        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.95f), RoundedCornerShape(26.dp))
                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(26.dp))
                    .padding(18.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .background(Color(0xFFEFF6FF), RoundedCornerShape(15.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = Primary, modifier = Modifier.size(20.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("Ritme belajar", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Color(0xFF0F172A))
                        Text(
                            if (user.xp == 0) "Mulai dari satu resep sederhana hari ini." else "Pertahankan progres memasakmu minggu ini.",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = TextSecondaryLight
                        )
                    }
                }
            }
        }

        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.95f), RoundedCornerShape(24.dp))
                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(24.dp))
            ) {
                ProfileInfoRow(Icons.Default.Mail, "Email", user.email)
                ProfileInfoRow(Icons.Default.Phone, "Nomor telepon", user.phone?.takeIf { it.isNotBlank() } ?: "Belum diatur")
                ProfileInfoRow(Icons.Default.CalendarToday, "Bergabung", user.createdAt?.take(10) ?: "-")
            }
        }

        item {
            ProfileAction(Icons.Default.Tune, "Preferensi aplikasi", "Personalisasi pengalaman memasak", onClick = onEditProfile)
        }
    }
}

@Composable
private fun ProfileTinyAction(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    isDanger: Boolean = false
) {
    val tint = if (isDanger) Color(0xFFE11D48) else Primary
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White.copy(alpha = 0.96f))
            .border(1.dp, if (isDanger) Color(0xFFFECACA) else Color(0xFFE2E8F0), RoundedCornerShape(20.dp))
            .clickable { onClick() }
            .padding(vertical = 14.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(21.dp))
        Spacer(modifier = Modifier.height(6.dp))
        Text(label, fontSize = 12.sp, fontWeight = FontWeight.Black, color = if (isDanger) Color(0xFF9F1239) else Color(0xFF0F172A))
    }
}

@Composable
private fun ProfileStatTile(
    label: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .background(Color.White.copy(alpha = 0.95f), RoundedCornerShape(22.dp))
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(22.dp))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(38.dp)
                .background(Color(0xFFEFF6FF), RoundedCornerShape(13.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = Primary, modifier = Modifier.size(19.dp))
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextSecondaryLight)
            Text(value, fontSize = 18.sp, fontWeight = FontWeight.Black, color = PrimaryDark, maxLines = 1)
        }
    }
}

@Composable
private fun ModernProfileContent(
    user: com.example.cookedu.models.User,
    onEditProfile: () -> Unit,
    onChangeAvatar: () -> Unit,
    onLogout: () -> Unit
) {
    val normalizedAvatarUrl = ImageUtils.getNormalizedImageUrl(LocalContext.current, user.avatarUrl)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.94f), RoundedCornerShape(28.dp))
                    .border(1.dp, Color.White, RoundedCornerShape(28.dp))
                    .padding(22.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(contentAlignment = Alignment.BottomEnd) {
                    Box(
                        modifier = Modifier
                            .size(112.dp)
                            .clip(RoundedCornerShape(30.dp))
                            .background(Color(0xFFE0F2FE))
                            .border(3.dp, Color.White, RoundedCornerShape(30.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        if (!normalizedAvatarUrl.isNullOrBlank()) {
                            AsyncImage(
                                model = normalizedAvatarUrl,
                                contentDescription = null,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        } else {
                            Text(
                                user.name.take(1).uppercase(),
                                fontSize = 42.sp,
                                fontWeight = FontWeight.Black,
                                color = PrimaryDark
                            )
                        }
                    }

                    IconButton(
                        onClick = onChangeAvatar,
                        modifier = Modifier
                            .size(38.dp)
                            .background(Primary, RoundedCornerShape(14.dp))
                            .border(2.dp, Color.White, RoundedCornerShape(14.dp))
                    ) {
                        Icon(
                            Icons.Default.CameraAlt,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))
                Text(
                    user.name,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF0F172A),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    user.email,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = TextSecondaryLight,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(18.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    ProfileMetric("XP", user.xp.toString(), Modifier.weight(1f))
                    ProfileMetric("Role", user.role?.replaceFirstChar { it.uppercase() } ?: "User", Modifier.weight(1f))
                }
            }
        }

        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.94f), RoundedCornerShape(24.dp))
                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(24.dp))
            ) {
                ProfileInfoRow(Icons.Default.Mail, "Email", user.email)
                ProfileInfoRow(Icons.Default.Phone, "Nomor telepon", user.phone?.takeIf { it.isNotBlank() } ?: "Belum diatur")
                ProfileInfoRow(Icons.Default.CalendarToday, "Bergabung", user.createdAt?.take(10) ?: "-")
            }
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                ProfileAction(Icons.Default.Edit, "Edit profil", "Ubah nama dan nomor telepon", onClick = onEditProfile)
                ProfileAction(Icons.Default.Image, "Ganti foto", "Unggah foto profil baru", onClick = onChangeAvatar)
                ProfileAction(
                    icon = Icons.AutoMirrored.Filled.ExitToApp,
                    title = "Keluar",
                    subtitle = "Akhiri sesi akun ini",
                    isDanger = true,
                    onClick = onLogout
                )
            }
        }
    }
}

@Composable
private fun ProfileMetric(label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .background(Color(0xFFF8FAFC), RoundedCornerShape(18.dp))
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(18.dp))
            .padding(14.dp)
    ) {
        Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextSecondaryLight)
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            value,
            fontSize = 18.sp,
            fontWeight = FontWeight.Black,
            color = PrimaryDark,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
private fun ProfileInfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(38.dp)
                .background(Color(0xFFEFF6FF), RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = Primary, modifier = Modifier.size(19.dp))
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextSecondaryLight)
            Text(
                value,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF0F172A),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun ProfileAction(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    isDanger: Boolean = false,
    onClick: () -> Unit
) {
    val tint = if (isDanger) Color(0xFFE11D48) else Primary
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color.White.copy(alpha = 0.94f))
            .border(1.dp, if (isDanger) Color(0xFFFECACA) else Color(0xFFE2E8F0), RoundedCornerShape(20.dp))
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(42.dp)
                .background(if (isDanger) Color(0xFFFFF1F2) else Color(0xFFEFF6FF), RoundedCornerShape(14.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(20.dp))
        }
        Spacer(modifier = Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = if (isDanger) Color(0xFF9F1239) else Color(0xFF0F172A))
            Text(subtitle, fontSize = 12.sp, color = TextSecondaryLight, fontWeight = FontWeight.Medium)
        }
        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color(0xFF94A3B8))
    }
}

@Composable
fun ProfileOption(
    text: String, 
    icon: androidx.compose.ui.graphics.vector.ImageVector, 
    isDanger: Boolean = false,
    onClick: () -> Unit = {}
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .shadow(2.dp, RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isDanger) Color(0xFFFFF1F1) else Color.White
        )
    ) {
        Row(
            modifier = Modifier.padding(18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                icon, 
                contentDescription = null, 
                tint = if (isDanger) Color(0xFFEF4444) else Primary, 
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(14.dp))
            Text(
                text, 
                fontSize = 15.sp, 
                fontWeight = FontWeight.Bold, 
                color = if (isDanger) Color(0xFF991B1B) else Color(0xFF0F172A)
            )
            Spacer(modifier = Modifier.weight(1f))
            Icon(
                Icons.Default.ChevronRight, 
                contentDescription = null, 
                tint = Color(0xFF94A3B8), 
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
fun EditProfileDialog(
    user: com.example.cookedu.models.User,
    hasPendingAvatar: Boolean,
    onDismiss: () -> Unit,
    onSave: (name: String, phone: String?) -> Unit
) {
    var name by remember { mutableStateOf(user.name) }
    var phone by remember { mutableStateOf(user.phone.orEmpty()) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(24.dp),
        containerColor = Color.White,
        title = { Text("Edit profil", fontWeight = FontWeight.Black, color = Color(0xFF0F172A)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                if (hasPendingAvatar) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFEFF6FF), RoundedCornerShape(14.dp))
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Primary, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Foto baru siap disimpan.", fontSize = 12.sp, color = PrimaryDark, fontWeight = FontWeight.Bold)
                    }
                }
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nama") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Primary,
                        unfocusedBorderColor = Color(0xFFE2E8F0),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Nomor telepon") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Primary,
                        unfocusedBorderColor = Color(0xFFE2E8F0),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    )
                )
                Text(user.email, fontSize = 12.sp, color = TextSecondaryLight, fontWeight = FontWeight.Medium)
            }
        },
        confirmButton = {
            Button(
                onClick = { onSave(name.trim(), phone.trim().ifBlank { null }) },
                enabled = name.isNotBlank(),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Primary)
            ) {
                Text("Simpan", color = Color.White, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Batal", color = TextSecondaryLight, fontWeight = FontWeight.Bold)
            }
        }
    )
}

// ----------------------------------------------------
// 1. COOKING MODE SCREEN
// ----------------------------------------------------
@Composable
fun CookingModeScreen(onNavigateBack: () -> Unit) {
    var currentStepIdx by remember { mutableStateOf(0) }
    val steps = listOf(
        "Siapkan bahan-bahan: 2 siung bawang putih cincang, 1/2 bawang bombay iris, 250gr fillet ayam, dan sayuran segar.",
        "Panaskan 2 sendok makan minyak zaitun di atas wajan anti lengket dengan api sedang.",
        "Tumis bawang putih dan bawang bombay hingga layu dan tercium aroma harum masakan.",
        "Masukkan potongan ayam fillet, masak perlahan hingga warnanya berubah kecokelatan.",
        "Masukkan sayuran pilihan Anda dan tuangkan saus tiram. Aduk merata hingga bumbu meresap sempurna.",
        "Sajikan tumisan hangat di atas piring saji yang cantik. Siap dinikmati bersama keluarga!"
    )
    val totalSteps = steps.size
    val progress = (currentStepIdx + 1).toFloat() / totalSteps

    val bgGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFFEFF6FF), Color.White)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgGradient)
    ) {
        // App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .background(Color.White, CircleShape)
                    .size(40.dp)
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Primary)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text("Mode Memasak Interaktif", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F172A))
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Step indicator
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    "LANGKAH ${currentStepIdx + 1} DARI $totalSteps",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Primary,
                    letterSpacing = 1.5.sp
                )
                Spacer(modifier = Modifier.height(12.dp))
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(CircleShape),
                    color = Primary,
                    trackColor = Primary.copy(alpha = 0.15f)
                )
            }

            // Interactive step card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp)
                    .shadow(8.dp, RoundedCornerShape(24.dp)),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(28.dp),
                    verticalArrangement = Arrangement.SpaceBetween,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        Icons.Default.RestaurantMenu,
                        contentDescription = null,
                        tint = Primary.copy(alpha = 0.2f),
                        modifier = Modifier.size(48.dp)
                    )
                    
                    Text(
                        steps[currentStepIdx],
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A),
                        textAlign = TextAlign.Center,
                        lineHeight = 26.sp
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(
                            onClick = { /* Simulate audio instruction */ },
                            modifier = Modifier.background(Color(0xFFEFF6FF), CircleShape)
                        ) {
                            Icon(Icons.Default.VolumeUp, contentDescription = null, tint = Primary)
                        }
                        IconButton(
                            onClick = { /* Set temporary alarm */ },
                            modifier = Modifier.background(Color(0xFFEFF6FF), CircleShape)
                        ) {
                            Icon(Icons.Default.Timer, contentDescription = null, tint = Primary)
                        }
                    }
                }
            }

            // Navigation Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Button(
                    onClick = { if (currentStepIdx > 0) currentStepIdx-- },
                    enabled = currentStepIdx > 0,
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp),
                    shape = RoundedCornerShape(25.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.White,
                        contentColor = Primary
                    ),
                    border = BorderStroke(1.dp, Primary)
                ) {
                    Text("Sebelumnya", fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = {
                        if (currentStepIdx < totalSteps - 1) {
                            currentStepIdx++
                        } else {
                            onNavigateBack()
                        }
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp)
                        .shadow(4.dp, RoundedCornerShape(25.dp)),
                    shape = RoundedCornerShape(25.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Primary)
                ) {
                    Text(
                        if (currentStepIdx == totalSteps - 1) "Selesai!" else "Lanjut",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}

// ----------------------------------------------------
// 2. FRIDGE SCANNER SCREEN
// ----------------------------------------------------
@Composable
fun FridgeScannerScreen(onNavigateBack: () -> Unit) {
    var isScanning by remember { mutableStateOf(false) }
    var showResults by remember { mutableStateOf(false) }

    val ingredients = listOf(
        Pair("Fillet Ayam", "500 gr"),
        Pair("Bawang Putih", "5 Siung"),
        Pair("Wortel", "2 Buah"),
        Pair("Susu Cair", "200 ml"),
        Pair("Telur Ayam", "6 Butir")
    )

    val bgGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFFEFF6FF), Color.White)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgGradient)
    ) {
        // App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .background(Color.White, CircleShape)
                    .size(40.dp)
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Primary)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text("Kulkas Cerdas", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F172A))
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Intro
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFDBEAFE))
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text(
                            "Scan isi kulkas Anda dan biarkan AI Chef mencarikan resep masakan yang paling cocok untuk Anda!",
                            fontSize = 13.sp,
                            color = Color(0xFF475569),
                            lineHeight = 20.sp
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = {
                                isScanning = true
                                showResults = false
                                // Simulate scanning completion
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Primary),
                            shape = RoundedCornerShape(24.dp)
                        ) {
                            Icon(Icons.Default.PhotoCamera, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Mulai Pindai Kulkas", fontWeight = FontWeight.Bold, color = Color.White)
                        }
                    }
                }
            }

            if (isScanning) {
                item {
                    LaunchedEffect(Unit) {
                        kotlinx.coroutines.delay(2000)
                        isScanning = false
                        showResults = true
                    }
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(120.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(color = Primary)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                "Menganalisis isi kulkas...",
                                fontSize = 12.sp,
                                color = Primary,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            if (showResults) {
                item {
                    Text(
                        "Bahan Makanan Ditemukan",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF0F172A)
                    )
                }

                items(ingredients) { item ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, Color(0xFFDBEAFE))
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .background(Color(0xFFEFF6FF), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.Kitchen, contentDescription = null, tint = Primary, modifier = Modifier.size(18.dp))
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(item.first, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                            }
                            Text(item.second, color = Primary, fontWeight = FontWeight.ExtraBold)
                        }
                    }
                }

                // Recommendations Banner
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = PrimaryDark)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Text(
                                "REKOMENDASI MENU AI",
                                fontSize = 10.sp,
                                color = PrimaryLight,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                "Sup Ayam Creamy Gurih",
                                fontSize = 18.sp,
                                color = Color.White,
                                fontWeight = FontWeight.ExtraBold
                            )
                            Text(
                                "Sangat cocok dimasak dengan menggunakan Wortel, Telur, dan Daging Ayam Anda.",
                                fontSize = 12.sp,
                                color = Color.White.copy(alpha = 0.8f)
                            )
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------
// 3. LEARNING SCREEN WITH QUIZ
// ----------------------------------------------------
@Composable
fun LearningScreen(onNavigateBack: () -> Unit) {
    var activeTab by remember { mutableStateOf("Materi") }
    var selectedQuizLesson by remember { mutableStateOf<String?>(null) }
    var quizScore by remember { mutableStateOf<Int?>(null) }
    var showQuizDialog by remember { mutableStateOf(false) }

    val lessonsList = listOf(
        Triple("Dasar Memotong Sayuran", "Keterampilan Pisau - Pemula", "15 Menit"),
        Triple("Teknik Tumis Sempurna", "Pan Searing - Pemula", "20 Menit"),
        Triple("Mengenal Rempah Nusantara", "Rempah & Bahan - Menengah", "30 Menit"),
        Triple("Membuat Kaldu Premium", "Kaldu & Sup - Mahir", "45 Menit")
    )

    val bgGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFFEFF6FF), Color.White)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgGradient)
    ) {
        // App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .background(Color.White, CircleShape)
                    .size(40.dp)
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Primary)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text("Modul Belajar Kuliner", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F172A))
        }

        // Tab Selector
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            listOf("Materi", "Kuis Bersertifikat").forEach { tab ->
                val isSelected = activeTab == tab
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(16.dp))
                        .background(if (isSelected) Primary else Color.White)
                        .border(1.dp, if (isSelected) Color.Transparent else Color(0xFFDBEAFE), RoundedCornerShape(16.dp))
                        .clickable { activeTab = tab }
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        tab,
                        color = if (isSelected) Color.White else Color(0xFF475569),
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (activeTab == "Materi") {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(lessonsList) { lesson ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(2.dp, RoundedCornerShape(20.dp)),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, Color(0xFFDBEAFE))
                    ) {
                        Row(
                            modifier = Modifier.padding(18.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(46.dp)
                                    .background(Color(0xFFEFF6FF), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.MenuBook, contentDescription = null, tint = Primary)
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(lesson.second.uppercase(), fontSize = 9.sp, color = Primary, fontWeight = FontWeight.Bold)
                                Text(lesson.first, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F172A))
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(Icons.Default.AccessTime, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(12.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(lesson.third, fontSize = 11.sp, color = Color.Gray)
                                }
                            }
                            IconButton(onClick = { /* Open video module */ }) {
                                Icon(Icons.Default.PlayCircleFilled, contentDescription = null, tint = Primary, modifier = Modifier.size(32.dp))
                            }
                        }
                    }
                }
            }
        } else {
            // Quiz certificates
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 20.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(lessonsList) { lesson ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(2.dp, RoundedCornerShape(20.dp)),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, Color(0xFFDBEAFE))
                    ) {
                        Row(
                            modifier = Modifier.padding(18.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("SERTIFIKASI KOKI", fontSize = 9.sp, color = Primary, fontWeight = FontWeight.Bold)
                                Text(lesson.first, fontSize = 15.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F172A))
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Status: Tersedia", fontSize = 11.sp, color = Color.Gray)
                            }
                            Button(
                                onClick = {
                                    selectedQuizLesson = lesson.first
                                    showQuizDialog = true
                                },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Primary)
                            ) {
                                Text("Mulai Kuis", fontSize = 12.sp, color = Color.White)
                            }
                        }
                    }
                }
            }
        }
    }

    if (showQuizDialog) {
        var answer1 by remember { mutableStateOf("") }
        var answer2 by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showQuizDialog = false },
            title = { Text("Kuis Interaktif: ${selectedQuizLesson ?: "Edukasi"}", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text("Pertanyaan 1: Apa nama teknik memotong sayur menjadi bentuk korek api tipis?", fontWeight = FontWeight.Bold)
                    Column {
                        listOf("Julienne", "Dice", "Chop").forEach { option ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { answer1 = option }
                                    .padding(vertical = 4.dp)
                            ) {
                                RadioButton(selected = answer1 == option, onClick = { answer1 = option })
                                Text(option, fontSize = 14.sp)
                            }
                        }
                    }

                    Text("Pertanyaan 2: Mengapa wajan harus sangat panas sebelum menumis?", fontWeight = FontWeight.Bold)
                    Column {
                        listOf("Agar sayur layu instan", "Menjaga kelembapan & kesegaran sayuran", "Agar bumbu menguap").forEach { option ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { answer2 = option }
                                    .padding(vertical = 4.dp)
                            ) {
                                RadioButton(selected = answer2 == option, onClick = { answer2 = option })
                                Text(option, fontSize = 14.sp)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val score = if (answer1 == "Julienne" && answer2 == "Menjaga kelembapan & kesegaran sayuran") 100 else 50
                        quizScore = score
                        showQuizDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Primary)
                ) {
                    Text("Kirim Jawaban", color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = { showQuizDialog = false }) {
                    Text("Tutup", color = Primary)
                }
            }
        )
    }

    if (quizScore != null) {
        AlertDialog(
            onDismissRequest = { quizScore = null },
            title = { Text("Hasil Kuis Kuliner", fontWeight = FontWeight.Bold) },
            text = {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text(
                        if (quizScore == 100) "Selamat! Anda Lulus Kuis 100%!" else "Coba lagi! Skor Anda $quizScore",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        if (quizScore == 100) "Anda berhasil mendapatkan tambahan +50 XP!" else "Tonton kembali video modul di atas untuk memahami materi.",
                        fontSize = 13.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center
                    )
                }
            },
            confirmButton = {
                Button(onClick = { quizScore = null }, colors = ButtonDefaults.buttonColors(containerColor = Primary)) {
                    Text("Oke", color = Color.White)
                }
            }
        )
    }
}

// ----------------------------------------------------
// 4. STATS SCREEN
// ----------------------------------------------------
@Composable
fun StatsScreen(onNavigateBack: () -> Unit) {
    val bgGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFFEFF6FF), Color.White)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgGradient)
    ) {
        // App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .background(Color.White, CircleShape)
                    .size(40.dp)
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Primary)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text("Statistik Memasak", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F172A))
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // General Streak Box
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = PrimaryDark)
                ) {
                    Row(
                        modifier = Modifier.padding(24.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("STREAK MEMASAK", fontSize = 10.sp, color = PrimaryLight, fontWeight = FontWeight.Bold)
                            Text("12 Hari Beruntun!", fontSize = 20.sp, color = Color.White, fontWeight = FontWeight.ExtraBold)
                        }
                        Icon(Icons.Default.LocalFireDepartment, contentDescription = null, tint = Color(0xFFFFB020), modifier = Modifier.size(44.dp))
                    }
                }
            }

            item {
                Text("Distribusi Masakan Anda", fontSize = 16.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F172A))
            }

            // Stats items
            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatsProgressBar("Main Course (Hidangan Utama)", 0.7f, "14 Resep")
                    StatsProgressBar("Dessert (Makanan Penutup)", 0.4f, "8 Resep")
                    StatsProgressBar("Soup & Appetizer", 0.25f, "4 Resep")
                }
            }

            // Summary Info
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFDBEAFE))
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text("Total XP Terkumpul", fontSize = 12.sp, color = Color.Gray)
                        Text("480 XP", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = Primary)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            "Anda mengungguli 85% koki pemula lainnya di wilayah Anda minggu ini! Terus pertahankan!",
                            fontSize = 12.sp,
                            color = Color(0xFF475569)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StatsProgressBar(label: String, value: Float, countText: String) {
    Column {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(label, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
            Text(countText, fontSize = 12.sp, color = Primary, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(6.dp))
        LinearProgressIndicator(
            progress = { value },
            modifier = Modifier
                .fillMaxWidth()
                .height(10.dp)
                .clip(CircleShape),
            color = Primary,
            trackColor = Color(0xFFDBEAFE)
        )
    }
}

// ----------------------------------------------------
// 5. COOKSHARE SCREEN
// ----------------------------------------------------
@Composable
fun CookShareScreen(onNavigateBack: () -> Unit) {
    val posts = listOf(
        Pair("Chef Riri", "Baru selesai mencoba resep Kue Lapis di CookEdu. Rasanya otentik dan manisnya pas. Yuk cobain juga!"),
        Pair("Koki Andi", "Tumis Sapi Lada Hitam buatan sendiri siang ini. Dagingnya empuk karena mengikuti panduan suhu dan timing dari CookEdu.")
    )

    val bgGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFFEFF6FF), Color.White)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgGradient)
    ) {
        // App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .background(Color.White, CircleShape)
                    .size(40.dp)
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Primary)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text("CookShare Community", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F172A))
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(posts) { post ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFDBEAFE))
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .background(Primary, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    post.first.take(1).uppercase(),
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(post.first, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                                Text("2 jam yang lalu", fontSize = 11.sp, color = Color.Gray)
                            }
                        }
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            post.second,
                            fontSize = 13.sp,
                            color = Color(0xFF334155),
                            lineHeight = 20.sp
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(24.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.FavoriteBorder, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("18", fontSize = 12.sp, color = Color.Gray)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Comment, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("4", fontSize = 12.sp, color = Color.Gray)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------
// 6. CATATAN IBU SCREEN
// ----------------------------------------------------
@Composable
fun CatatanIbuScreen(onNavigateBack: () -> Unit) {
    val notes = listOf(
        Pair("Rahasia Sambal Bajak Legendaris", "Agar sambal tahan lama tanpa pengawet, tumis cabai dan tomat dengan api kecil hingga airnya benar-benar habis, lalu tambahkan sedikit gula aren asli pada bagian akhir."),
        Pair("Teknik Merebus Daging Empuk", "Gunakan metode 5-30-7: Rebus daging selama 5 menit, matikan api lalu biarkan wajan tertutup rapat selama 30 menit, kemudian rebus kembali selama 7 menit.")
    )

    val bgGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFFEFF6FF), Color.White)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgGradient)
    ) {
        // App Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .background(Color.White, CircleShape)
                    .size(40.dp)
            ) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Primary)
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text("Catatan Ibu", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F172A))
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB)),
                    border = BorderStroke(1.dp, Color(0xFFFDE68A))
                ) {
                    Row(
                        modifier = Modifier.padding(18.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.MenuBook, contentDescription = null, tint = Color(0xFFD97706))
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            "Kumpulan tips warisan turun temurun untuk citarasa masakan rumah yang otentik.",
                            fontSize = 12.sp,
                            color = Color(0xFF92400E)
                        )
                    }
                }
            }

            items(notes) { note ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(2.dp, RoundedCornerShape(20.dp)),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFDBEAFE))
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text(
                            note.first,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFF0F172A)
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            note.second,
                            fontSize = 13.sp,
                            color = Color(0xFF475569),
                            lineHeight = 20.sp
                        )
                    }
                }
            }
        }
    }
}
