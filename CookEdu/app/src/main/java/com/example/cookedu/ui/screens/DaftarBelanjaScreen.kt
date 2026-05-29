package com.example.cookedu.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.cookedu.R
import com.example.cookedu.ui.theme.Cyan50
import com.example.cookedu.ui.theme.Cyan100
import com.example.cookedu.ui.theme.Primary
import com.example.cookedu.ui.theme.TextSecondaryLight
import com.example.cookedu.ui.viewmodel.ShoppingListUiState
import com.example.cookedu.ui.viewmodel.ShoppingListViewModel

@Composable
fun DaftarBelanjaScreen(
    viewModel: ShoppingListViewModel,
    returnRecipeId: String? = null,
    onNavigateBack: () -> Unit,
    onNavigateToLogin: () -> Unit = {}
) {
    var searchQuery by remember { mutableStateOf("") }
    var showAddDialog by remember { mutableStateOf(false) }
    var newName by remember { mutableStateOf("") }
    var newQty by remember { mutableStateOf("") }
    var newUnit by remember { mutableStateOf("") }
    var newCategory by remember { mutableStateOf("") }
    
    val uiState by viewModel.uiState.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Cyan100, Cyan50, Color.White)))
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Spacer(modifier = Modifier.height(36.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(36.dp))
                    .background(Color.White.copy(alpha = 0.86f))
                    .border(1.dp, Color.White, RoundedCornerShape(36.dp))
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                IconButton(
                    onClick = onNavigateBack,
                    modifier = Modifier
                        .background(Cyan50, RoundedCornerShape(18.dp))
                        .border(1.dp, Color.White, RoundedCornerShape(18.dp))
                ) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Primary)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Daftar Belanja", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Color(0xFF0F172A))
                    Text("Checklist bahan & pantry", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextSecondaryLight)
                }
                IconButton(
                    onClick = { showAddDialog = true },
                    modifier = Modifier
                        .background(Brush.linearGradient(listOf(Primary, Color(0xFF245E88))), RoundedCornerShape(18.dp))
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedButton(
                onClick = onNavigateBack,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .height(52.dp),
                shape = RoundedCornerShape(22.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = Color.White.copy(alpha = 0.9f),
                    contentColor = Primary
                ),
                border = androidx.compose.foundation.BorderStroke(1.dp, Cyan100)
            ) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    if (returnRecipeId != null) "Kembali ke resep" else "Lihat resep",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Cari item belanja...") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .height(58.dp),
                shape = RoundedCornerShape(24.dp),
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedContainerColor = Color.White.copy(alpha = 0.85f),
                    focusedContainerColor = Color.White.copy(alpha = 0.9f),
                    focusedBorderColor = Primary.copy(alpha = 0.35f),
                    unfocusedBorderColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(12.dp))

            when (val state = uiState) {
                is ShoppingListUiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Primary)
                    }
                }
                is ShoppingListUiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(state.message, color = Color.Red, fontSize = 14.sp)
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(onClick = { viewModel.loadItems() }) {
                                Text("Coba Lagi")
                            }
                        }
                    }
                }
                is ShoppingListUiState.Success -> {
                    val filteredItems = state.items.filter { item ->
                        searchQuery.isBlank() || item.name.contains(searchQuery, ignoreCase = true)
                    }

                    val checkedCount = filteredItems.count { it.isChecked }
                    val totalCount = filteredItems.size
                    val progress = if (totalCount == 0) 0f else checkedCount.toFloat() / totalCount.toFloat()

                    Column(modifier = Modifier.fillMaxSize()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp)
                                .background(Color.White.copy(alpha = 0.88f), RoundedCornerShape(28.dp))
                                .border(1.dp, Color.White, RoundedCornerShape(28.dp))
                                .padding(horizontal = 16.dp, vertical = 14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Progress belanja", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0F172A))
                                Text("$checkedCount/$totalCount item selesai", fontSize = 11.sp, color = TextSecondaryLight, fontWeight = FontWeight.SemiBold)
                            }
                            TextButton(
                                onClick = { viewModel.clearCheckedItems() },
                                enabled = checkedCount > 0
                            ) {
                                Text("Clear Checked", fontWeight = FontWeight.Black)
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        LinearProgressIndicator(
                            progress = { progress },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp)
                                .height(8.dp)
                                .clip(RoundedCornerShape(99.dp)),
                            color = Primary,
                            trackColor = Cyan100
                        )

                        Spacer(modifier = Modifier.height(14.dp))
                    
                    if (filteredItems.isEmpty()) {
                        Box(modifier = Modifier.fillMaxSize().padding(16.dp), contentAlignment = Alignment.Center) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Image(
                                    painter = painterResource(id = R.drawable.img_inspiration3),
                                    contentDescription = null,
                                    modifier = Modifier
                                        .size(120.dp)
                                        .clip(RoundedCornerShape(28.dp))
                                        .border(1.dp, Color.White, RoundedCornerShape(28.dp)),
                                    contentScale = ContentScale.Crop
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Text("Belum ada item belanja", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color(0xFF0F172A))
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Tap tombol + untuk menambah item", fontSize = 13.sp, color = TextSecondaryLight, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    } else {
                        val grouped = filteredItems.groupBy { it.category?.takeIf { c -> c.isNotBlank() } ?: "Umum" }
                        LazyColumn(
                            modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            contentPadding = PaddingValues(bottom = 80.dp)
                        ) {
                            grouped.forEach { (category, itemsInCategory) ->
                                item {
                                    Text(
                                        category.uppercase(),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color(0xFF475569),
                                        modifier = Modifier.padding(top = 8.dp, bottom = 4.dp),
                                        letterSpacing = 1.sp
                                    )
                                }
                                items(itemsInCategory) { item ->
                                    ShoppingListItem(
                                        item = item,
                                        onToggleChecked = { viewModel.toggleItemChecked(item.id, !item.isChecked) },
                                        onDelete = { viewModel.deleteItem(item.id) }
                                    )
                                }
                            }
                        }
                    }
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Tambah Item", fontWeight = FontWeight.Black) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = newName,
                        onValueChange = { newName = it },
                        label = { Text("Nama item") },
                        singleLine = true
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = newQty,
                            onValueChange = { newQty = it },
                            label = { Text("Qty") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                        )
                        OutlinedTextField(
                            value = newUnit,
                            onValueChange = { newUnit = it },
                            label = { Text("Unit") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }
                    OutlinedTextField(
                        value = newCategory,
                        onValueChange = { newCategory = it },
                        label = { Text("Kategori (opsional)") },
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        val name = newName.trim()
                        if (name.isNotEmpty()) {
                            viewModel.addItem(
                                name = name,
                                quantity = newQty.trim().ifBlank { "1" },
                                unit = newUnit.trim().ifBlank { "unit" },
                                category = newCategory.trim().ifBlank { null }
                            )
                            newName = ""
                            newQty = ""
                            newUnit = ""
                            newCategory = ""
                            showAddDialog = false
                        }
                    }
                ) { Text("Tambah", fontWeight = FontWeight.Black) }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) { Text("Batal") }
            }
        )
    }
}

@Composable
fun ShoppingListItem(
    item: com.example.cookedu.models.ShoppingItem,
    onToggleChecked: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(26.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.92f)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Cyan100.copy(alpha = 0.7f))
    ) {
        Row(
            modifier = Modifier.padding(18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = item.isChecked,
                onCheckedChange = { onToggleChecked() }
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(item.name, fontSize = 16.sp, fontWeight = FontWeight.Medium, color = Color(0xFF0F172A))
                Text("${item.quantity} ${item.unit}", fontSize = 14.sp, color = TextSecondaryLight)
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, contentDescription = null, tint = Color(0xFFDC2626))
            }
        }
    }
}
