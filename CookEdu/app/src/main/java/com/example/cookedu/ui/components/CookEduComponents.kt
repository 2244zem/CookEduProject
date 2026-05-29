package com.example.cookedu.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.cookedu.ui.theme.Cyan100
import com.example.cookedu.ui.theme.Cyan50
import com.example.cookedu.ui.theme.Primary
import com.example.cookedu.ui.theme.PrimaryDark
import com.example.cookedu.ui.theme.TextSecondaryLight

@Composable
fun PressableScale(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    content: @Composable BoxScope.() -> Unit
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (pressed) 0.97f else 1f,
        animationSpec = tween(120),
        label = "pressScale"
    )

    Box(
        modifier = modifier
            .scale(scale)
            .clickable(interactionSource = interaction, indication = null, onClick = onClick),
        content = content
    )
}

@Composable
fun CookEduCard(
    modifier: Modifier = Modifier,
    radius: Dp = 34.dp,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    val shape = RoundedCornerShape(radius)
    val card = Modifier
        .then(modifier)
        .clip(shape)
        .background(Color.White.copy(alpha = 0.92f))
        .border(1.dp, Color.White.copy(alpha = 0.86f), shape)
        .padding(20.dp)

    if (onClick != null) {
        PressableScale(modifier = Modifier.fillMaxWidth(), onClick = onClick) {
            Column(modifier = card, content = content)
        }
    } else {
        Column(modifier = card, content = content)
    }
}

@Composable
fun CookEduTopBar(
    title: String,
    subtitle: String? = null,
    actionIcon: ImageVector? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontSize = 26.sp, fontWeight = FontWeight.Black, color = Color(0xFF0F172A))
            if (!subtitle.isNullOrBlank()) {
                Text(subtitle, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextSecondaryLight)
            }
        }
        if (actionIcon != null && onAction != null) {
            IconButton(
                onClick = onAction,
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(Color.White.copy(alpha = 0.88f))
                    .border(1.dp, Color.White, RoundedCornerShape(18.dp))
            ) {
                Icon(actionIcon, contentDescription = null, tint = Primary)
            }
        }
    }
}

@Composable
fun CookEduActionTile(
    icon: ImageVector,
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    PressableScale(modifier = modifier, onClick = onClick) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(32.dp))
                .background(Brush.verticalGradient(listOf(Color.White, Cyan50)))
                .border(1.dp, Color.White.copy(alpha = 0.9f), RoundedCornerShape(32.dp))
                .padding(18.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(Cyan100),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = Primary, modifier = Modifier.size(21.dp))
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(title, fontSize = 15.sp, fontWeight = FontWeight.Black, color = Color(0xFF0F172A), maxLines = 1)
            Text(subtitle, fontSize = 12.sp, fontWeight = FontWeight.Medium, color = TextSecondaryLight, maxLines = 2)
        }
    }
}

@Composable
fun CookEduShimmerBox(
    modifier: Modifier = Modifier,
    radius: Dp = 20.dp
) {
    val transition = rememberInfiniteTransition(label = "cookEduShimmer")
    val shimmerOffset by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1200, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "cookEduShimmerOffset"
    )

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(radius))
            .background(
                Brush.linearGradient(
                    colors = listOf(Color(0xFFC4E2F5), Color(0xFFF7FCFF), Color(0xFFC4E2F5)),
                    start = Offset(shimmerOffset - 1000f, 0f),
                    end = Offset(shimmerOffset, 0f)
                )
            )
    )
}

@Composable
fun CookEduEmptyState(
    icon: ImageVector,
    title: String,
    body: String,
    modifier: Modifier = Modifier
) {
    CookEduCard(modifier = modifier.fillMaxWidth(), radius = 36.dp) {
        Box(
            modifier = Modifier
                .size(74.dp)
                .clip(RoundedCornerShape(28.dp))
                .background(Cyan100)
                .align(Alignment.CenterHorizontally),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = PrimaryDark, modifier = Modifier.size(34.dp))
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text(title, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center, fontSize = 17.sp, fontWeight = FontWeight.Black, color = Color(0xFF0F172A))
        Spacer(modifier = Modifier.height(6.dp))
        Text(body, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = TextSecondaryLight, maxLines = 3, overflow = TextOverflow.Ellipsis)
    }
}
