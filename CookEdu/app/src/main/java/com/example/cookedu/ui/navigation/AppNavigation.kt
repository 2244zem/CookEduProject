@file:Suppress("SpellCheckingInspection")

package com.example.cookedu.ui.navigation

import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.draw.clip
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.cookedu.ui.screens.*
import com.example.cookedu.ui.theme.Cyan50
import com.example.cookedu.ui.theme.Primary
import com.example.cookedu.ui.theme.PrimaryDark
import com.example.cookedu.ui.viewmodel.*

@Composable
fun AppNavigation(initialDeepLink: String? = null) {
    val navController = rememberNavController()
    val context = LocalContext.current
    val factory = ViewModelFactory(context)
    var pendingRecipeId by remember(initialDeepLink) {
        mutableStateOf(parseRecipeDeepLinkId(initialDeepLink))
    }
    var handledDeepLink by remember { mutableStateOf<String?>(null) }

    fun nextRouteAfterAuth(): String {
        val recipeId = pendingRecipeId
        pendingRecipeId = null
        if (!recipeId.isNullOrBlank()) handledDeepLink = initialDeepLink
        return if (!recipeId.isNullOrBlank()) "recipe_detail/$recipeId" else "dashboard"
    }

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val bottomBarRoutes = listOf("dashboard", "recipe_list", "favorite_recipes", "daftar_belanja", "profile")
    val currentRootRoute = currentRoute?.substringBefore("/")?.substringBefore("?")
    val isBottomBarVisible = currentRootRoute in bottomBarRoutes

    LaunchedEffect(initialDeepLink, currentRootRoute) {
        val recipeId = parseRecipeDeepLinkId(initialDeepLink)
        if (
            !recipeId.isNullOrBlank() &&
            handledDeepLink != initialDeepLink &&
            currentRootRoute != null &&
            currentRootRoute != "splash"
        ) {
            pendingRecipeId = recipeId
            if (currentRootRoute !in listOf("login", "register", "onboarding")) {
                handledDeepLink = initialDeepLink
                pendingRecipeId = null
                navController.navigate("recipe_detail/$recipeId") {
                    launchSingleTop = true
                }
            }
        }
    }

    Scaffold(
        bottomBar = {
            AnimatedVisibility(
                visible = isBottomBarVisible,
                enter = slideInHorizontally(initialOffsetX = { it }) + fadeIn(),
                exit = slideOutHorizontally(targetOffsetX = { it }) + fadeOut()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.verticalGradient(
                                listOf(Color.Transparent, Cyan50, Cyan50)
                            )
                        )
                        .navigationBarsPadding(),
                    contentAlignment = Alignment.Center
                ) {
                    NavigationBar(
                        modifier = Modifier
                            .padding(horizontal = 20.dp, vertical = 10.dp)
                            .clip(RoundedCornerShape(34.dp))
                            .border(1.dp, Color.White.copy(alpha = 0.9f), RoundedCornerShape(34.dp)),
                        containerColor = Color.White.copy(alpha = 0.92f),
                        contentColor = PrimaryDark,
                        tonalElevation = 0.dp
                    ) {
                        val items = listOf(
                            Triple("dashboard", "Home", Icons.Default.Home),
                            Triple("recipe_list", "Resep", Icons.AutoMirrored.Filled.MenuBook),
                            Triple("favorite_recipes", "Favorit", Icons.Default.Favorite),
                            Triple("daftar_belanja", "Belanja", Icons.Default.ShoppingCart),
                            Triple("profile", "Profil", Icons.Default.Person)
                        )
                        items.forEach { (route, label, icon) ->
                            NavigationBarItem(
                                icon = { Icon(icon, contentDescription = label) },
                                label = { Text(label) },
                                selected = currentRoute?.startsWith(route) == true,
                                onClick = {
                                    navController.navigate(route) {
                                        popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = Color.White,
                                    selectedTextColor = PrimaryDark,
                                    indicatorColor = Primary,
                                    unselectedIconColor = PrimaryDark.copy(alpha = 0.62f),
                                    unselectedTextColor = PrimaryDark.copy(alpha = 0.62f)
                                )
                            )
                        }
                    }
                }
            }
        },
        containerColor = Cyan50
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "splash",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("splash") {
                SplashScreen(
                    onNavigateToNext = { route ->
                        val targetRoute = if (route == "dashboard" && pendingRecipeId != null) {
                            nextRouteAfterAuth()
                        } else {
                            route
                        }
                        navController.navigate(targetRoute) {
                            popUpTo("splash") { inclusive = true }
                        }
                    }
                )
            }
            composable("onboarding") {
                OnboardingScreen(
                    onFinished = {
                        navController.navigate("login") {
                            popUpTo("onboarding") { inclusive = true }
                        }
                    }
                )
            }
            composable(
                route = "login",
                enterTransition = {
                    slideInHorizontally(
                        initialOffsetX = { -it },
                        animationSpec = spring(dampingRatio = 0.8f, stiffness = 300f)
                    ) + fadeIn()
                },
                exitTransition = {
                    slideOutHorizontally(
                        targetOffsetX = { -it },
                        animationSpec = spring(dampingRatio = 0.8f, stiffness = 300f)
                    ) + fadeOut()
                }
            ) {
                val authViewModel: AuthViewModel = viewModel(factory = factory)
                LoginScreen(
                    viewModel = authViewModel,
                    onNavigateToDashboard = {
                        navController.navigate(nextRouteAfterAuth()) {
                            popUpTo("login") { inclusive = true }
                        }
                    },
                    onNavigateToRegister = {
                        navController.navigate("register")
                    }
                )
            }
            composable(
                route = "register",
                enterTransition = {
                    slideInHorizontally(
                        initialOffsetX = { it },
                        animationSpec = spring(dampingRatio = 0.8f, stiffness = 300f)
                    ) + fadeIn()
                },
                exitTransition = {
                    slideOutHorizontally(
                        targetOffsetX = { it },
                        animationSpec = spring(dampingRatio = 0.8f, stiffness = 300f)
                    ) + fadeOut()
                }
            ) {
                val authViewModel: AuthViewModel = viewModel(factory = factory)
                RegisterScreen(
                    viewModel = authViewModel,
                    onNavigateToLogin = {
                        navController.popBackStack()
                    },
                    onNavigateToDashboard = {
                        navController.navigate(nextRouteAfterAuth()) {
                            popUpTo("login") { inclusive = true }
                            popUpTo("register") { inclusive = true }
                        }
                    }
                )
            }
            composable("dashboard") {
                val dashboardViewModel: DashboardViewModel = viewModel(factory = factory)
                UserDashboardScreen(
                    viewModel = dashboardViewModel,
                    onNavigateToLogin = { navController.navigate("login") { popUpTo("dashboard") { inclusive = true } } },
                    onNavigateToAi = { navController.navigate("ai_assistant") },
                    onNavigateToRecipe = { id -> navController.navigate("recipe_detail/$id") }
                )
            }
            
            composable("recipe_list") {
                val recipeViewModel: RecipeViewModel = viewModel(factory = factory)
                RecipeListScreen(
                    viewModel = recipeViewModel,
                    onNavigateBack = { navController.navigateUp() },
                    onNavigateToDetail = { id -> navController.navigate("recipe_detail/$id") }
                )
            }

            composable("favorite_recipes") {
                val recipeViewModel: RecipeViewModel = viewModel(factory = factory)
                FavoriteRecipesScreen(
                    viewModel = recipeViewModel,
                    onNavigateToDetail = { id -> navController.navigate("recipe_detail/$id") }
                )
            }
            
            composable(
                route = "recipe_detail/{id}",
                enterTransition = {
                    scaleIn(animationSpec = spring(dampingRatio = 0.8f, stiffness = 300f)) + fadeIn()
                },
                exitTransition = {
                    scaleOut(animationSpec = spring(dampingRatio = 0.8f, stiffness = 300f)) + fadeOut()
                }
            ) { backStackEntry -> 
                val id = backStackEntry.arguments?.getString("id") ?: "1"
                val recipeViewModel: RecipeViewModel = viewModel(factory = factory)
                val shoppingListViewModel: ShoppingListViewModel = viewModel(factory = factory)
                RecipeDetailScreen(
                    recipeId = id, 
                    viewModel = recipeViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onAddIngredientsToShopping = { recipeIdInt, ingredients ->
                        shoppingListViewModel.addIngredientsFromRecipe(recipeIdInt, ingredients)
                        navController.navigate("daftar_belanja?recipeId=$recipeIdInt")
                    }
                ) 
            }
            
            composable(
                route = "daftar_belanja?recipeId={recipeId}",
                arguments = listOf(
                    navArgument("recipeId") {
                        type = NavType.StringType
                        nullable = true
                        defaultValue = null
                    }
                )
            ) { backStackEntry ->
                val returnRecipeId = backStackEntry.arguments?.getString("recipeId")
                val shoppingListViewModel: ShoppingListViewModel = viewModel(factory = factory)
                DaftarBelanjaScreen(
                    viewModel = shoppingListViewModel,
                    returnRecipeId = returnRecipeId,
                    onNavigateBack = {
                        if (returnRecipeId != null) {
                            navController.popBackStack()
                        } else {
                            navController.navigate("recipe_list") {
                                launchSingleTop = true
                            }
                        }
                    }
                ) 
            }
            
            composable("profile") { 
                val authViewModel: AuthViewModel = viewModel(factory = factory)
                val profileViewModel: com.example.cookedu.ui.viewmodel.ProfileViewModel = viewModel(factory = factory)
                ProfileScreen(
                    profileViewModel = profileViewModel,
                    authViewModel = authViewModel,
                    onNavigateBack = { navController.popBackStack() },
                    onNavigateToLogin = { navController.navigate("login") }
                ) 
            }
            
            composable("ai_assistant") { 
                val aiAssistantViewModel: AiAssistantViewModel = viewModel(factory = factory)
                AiAssistantScreen(
                    viewModel = aiAssistantViewModel,
                    onNavigateBack = { navController.popBackStack() }
                ) 
            }
            
            composable("cooking_mode") { CookingModeScreen { navController.popBackStack() } }
            composable("cookshare") { CookShareScreen { navController.popBackStack() } }
            composable("fridge_scanner") { FridgeScannerScreen { navController.popBackStack() } }
            composable("learning") { LearningScreen { navController.popBackStack() } }
            composable("catatan_ibu") { CatatanIbuScreen { navController.popBackStack() } }
            composable("stats") { StatsScreen { navController.popBackStack() } }
        }
    }
}

private fun parseRecipeDeepLinkId(link: String?): String? {
    if (link.isNullOrBlank()) return null
    return runCatching {
        val uri = Uri.parse(link)
        when {
            uri.scheme == "cookedu" && uri.host == "recipe" -> uri.pathSegments.firstOrNull()
            uri.pathSegments.firstOrNull() == "recipe" -> uri.pathSegments.getOrNull(1)
            else -> null
        }
    }.getOrNull()?.takeIf { it.isNotBlank() }
}
