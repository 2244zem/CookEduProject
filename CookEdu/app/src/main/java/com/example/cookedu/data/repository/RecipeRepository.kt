package com.example.cookedu.data.repository

import com.example.cookedu.api.ApiService
import com.example.cookedu.data.local.dao.RecipeDao
import com.example.cookedu.data.local.dao.RecipeDetailDao
import com.example.cookedu.data.local.mappers.*
import com.example.cookedu.models.Recipe
import com.example.cookedu.models.Category
import com.example.cookedu.models.Ingredient
import com.example.cookedu.models.NutritionInfo
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

data class RecipePageResult(
    val recipes: List<Recipe>,
    val currentPage: Int,
    val lastPage: Int,
    val total: Int
)

interface RecipeRepository {
    fun getRecipes(
        categoryId: Int? = null,
        search: String? = null,
        forceRefresh: Boolean = false
    ): Flow<Result<List<Recipe>>>
    
    fun getRecipeDetail(id: Int, forceRefresh: Boolean = false): Flow<Result<Recipe>>
    
    suspend fun getCategories(): Result<List<Category>>
    suspend fun getFavoriteRecipes(): List<Recipe>
    suspend fun toggleFavorite(recipe: Recipe, isFavorite: Boolean)
    suspend fun getRecipesPage(
        page: Int,
        categoryId: Int? = null,
        search: String? = null,
        perPage: Int = 20
    ): Result<RecipePageResult>
}

class RecipeRepositoryImpl(
    private val apiService: ApiService,
    private val recipeDao: RecipeDao,
    private val recipeDetailDao: RecipeDetailDao
) : RecipeRepository {
    private val useLocalDummyOnly = false

    // Hardcoded high-fidelity cooking tutorials matching RecipeOverhaulSeeder exactly
    private val baseFallbackRecipes = listOf(
        Recipe(
            id = 1,
            title = "Gado-Gado Siram Spesial",
            slug = "gado-gado-siram-spesial",
            description = "Menu salad khas Indonesia dengan bumbu kacang yang kental dan gurih. Belajar teknik merebus sayuran agar tetap renyah.",
            imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000",
            difficulty = "Intermediate",
            cookingTime = 45,
            prepTime = 15,
            ingredients = listOf(
                Ingredient("Kacang Tanah Goreng", "200", "gram"),
                Ingredient("Gula Merah Sisir", "50", "gram"),
                Ingredient("Santan Kental", "200", "ml"),
                Ingredient("Kentang Rebus", "2", "buah"),
                Ingredient("Tahu & Tempe Goreng", "4", "potong"),
                Ingredient("Kacang Panjang (potong 3cm)", "100", "gram"),
                Ingredient("Tauge (siangi)", "100", "gram"),
                Ingredient("Bayam/Kangkung", "1", "ikat"),
                Ingredient("Telur Rebus", "2", "butir")
            ),
            steps = listOf(
                "Persiapan Sayur: Rebus air hingga mendidih. Masukkan kacang panjang selama 2 menit, lalu angkat dan tiriskan. Ulangi untuk tauge (30 detik) dan bayam (1 menit). Jangan rebus terlalu lama agar vitamin terjaga.",
                "Membuat Bumbu Kacang: Haluskan kacang tanah goreng menggunakan blender atau ulekan hingga halus. Tumis bumbu halus (bawang putih, kencur, cabai) hingga harum.",
                "Masak Saus: Masukkan kacang halus ke wajan, tambahkan gula merah, air asam jawa, dan santan. Aduk terus dengan api kecil hingga saus mengental dan mengeluarkan minyak.",
                "Plating: Tata kentang, tahu, tempe, dan sayuran rebus di piring. Siram dengan bumbu kacang kental di atasnya. Taburkan bawang goreng dan kerupuk sebagai pelengkap."
            ),
            nutritionalInfo = NutritionInfo(450, 15.0, 40.0, 25.0),
            category = Category(5, "Masakan Indonesia", "masakan-indonesia")
        ),
        Recipe(
            id = 2,
            title = "Teknik Dasar Pisau (Basic Cuts)",
            slug = "teknik-dasar-pisau-basic-cuts",
            description = "Langkah pertama menjadi koki: Pelajari cara memegang pisau dan memotong sayuran dengan presisi standar restoran.",
            imageUrl = "https://images.unsplash.com/photo-1594385208974-2e75f9d3a513?auto=format&fit=crop&q=80&w=1000",
            difficulty = "Beginner",
            cookingTime = 20,
            prepTime = 5,
            ingredients = listOf(
                Ingredient("Bawang Bombay", "1", "buah"),
                Ingredient("Wortel Ukuran Besar", "2", "buah"),
                Ingredient("Seledri Impor", "2", "batang")
            ),
            steps = listOf(
                "Posisi Tangan (Claw Grip): Tekuk ujung jari tangan kiri Anda ke dalam seperti cakar. Tempelkan buku jari ke badan pisau untuk memandu pemotongan tanpa risiko jari teriris.",
                "Teknik Dice (Kotak): Kupas wortel, belah menjadi 4 bagian memanjang, lalu tumpuk dan potong melintang sehingga membentuk dadu ukuran 1x1 cm (Mirepoix).",
                "Teknik Julienne (Korek Api): Potong wortel sepanjang 5cm, iris tipis menjadi lembaran, tumpuk, lalu iris memanjang setebal 2mm hingga berbentuk seperti korek api."
            ),
            nutritionalInfo = NutritionInfo(50, 1.0, 12.0, 0.5),
            category = Category(1, "Teknik Dasar", "teknik-dasar")
        ),
        Recipe(
            id = 3,
            title = "Teknik Menumis Brokoli (Sautéing)",
            slug = "teknik-menumis-brokoli-sauteing",
            description = "Rahasia sayuran tetap hijau cerah dan renyah. Pelajari teknik 'Shocking' untuk menghentikan proses pemasakan.",
            imageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000",
            difficulty = "Beginner",
            cookingTime = 15,
            prepTime = 5,
            ingredients = listOf(
                Ingredient("Brokoli (potong per kuntum)", "250", "gram"),
                Ingredient("Bawang Putih (cincang kasar)", "3", "siung"),
                Ingredient("Minyak Zaitun/Margarin", "2", "sdm"),
                Ingredient("Garam & Kaldu Jamur", "1", "secukupnya")
            ),
            steps = listOf(
                "Blanching & Shocking: Didihkan air dengan sedikit garam. Masukkan brokoli selama 60 detik. Segera angkat dan masukkan ke wadah berisi air es (ini adalah teknik Shocking agar warna tetap hijau).",
                "Preheat Wajan: Panaskan wajan hingga benar-benar panas. Masukkan minyak, tunggu hingga minyak terlihat bergelombang (shimmering).",
                "Sauté: Masukkan bawang putih, tumis hingga kuning keemasan. Masukkan brokoli yang sudah ditiriskan, aduk cepat dengan api besar selama 2-3 menit saja.",
                "Seasoning: Tambahkan garam dan kaldu jamur di detik terakhir sebelum diangkat untuk menjaga tekstur sayuran tetap renyah."
            ),
            nutritionalInfo = NutritionInfo(135, 5.0, 8.0, 10.0),
            category = Category(2, "Sayuran", "sayuran")
        ),
        Recipe(
            id = 4,
            title = "Ayam Goreng Lengkuas Gurih",
            slug = "ayam-goreng-lengkuas-gurih",
            description = "Ayam goreng dengan bumbu lengkuas parut yang melimpah, memberikan tekstur renyah dan aroma harum yang menggugah selera.",
            imageUrl = "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
            difficulty = "Intermediate",
            cookingTime = 45,
            prepTime = 10,
            ingredients = listOf(
                Ingredient("Daging Ayam", "1000", "gram"),
                Ingredient("Lengkuas Parut", "200", "gram"),
                Ingredient("Bawang Putih", "5", "siung"),
                Ingredient("Sereh", "2", "batang"),
                Ingredient("Kunyit", "2", "cm"),
                Ingredient("Garam Dapur", "1.5", "sdt")
            ),
            steps = listOf(
                "Haluskan bawang putih, kunyit, dan garam dapur, lalu lumuri ke daging ayam.",
                "Campurkan parutan lengkuas dan sereh memar ke dalam ayam yang dimarinasi.",
                "Ungkep ayam bersama bumbu di atas api kecil hingga air menyusut dan bumbu meresap.",
                "Panaskan minyak goreng, lalu goreng ayam dan remahan lengkuas secara terpisah hingga kuning keemasan."
            ),
            nutritionalInfo = NutritionInfo(420, 35.0, 12.0, 28.0),
            category = Category(5, "Masakan Indonesia", "masakan-indonesia")
        ),
        Recipe(
            id = 5,
            title = "Soto Ayam Kuah Bening",
            slug = "soto-ayam-kuah-bening",
            description = "Soto ayam khas Indonesia dengan kuah bening yang segar dan kaya rempah. Cocok dinikmati selagi hangat.",
            imageUrl = "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=600&q=80",
            difficulty = "Intermediate",
            cookingTime = 40,
            prepTime = 10,
            ingredients = listOf(
                Ingredient("Daging Ayam", "500", "gram"),
                Ingredient("Bawang Putih", "4", "siung"),
                Ingredient("Sereh", "1", "batang"),
                Ingredient("Daun Salam", "2", "lembar"),
                Ingredient("Tauge", "100", "gram"),
                Ingredient("Soun (rendam air)", "50", "gram")
            ),
            steps = listOf(
                "Rebus ayam hingga empuk, lalu suwir-suwir dagingnya. Sisihkan kaldunya.",
                "Tumis bumbu halus (bawang putih, kemiri, kunyit) lalu masukkan ke dalam air kaldu.",
                "Masukkan sereh dan daun salam, masak hingga harum.",
                "Sajikan suwiran ayam, tauge, dan soun di mangkuk, lalu siram dengan kuah panas."
            ),
            nutritionalInfo = NutritionInfo(280, 22.0, 30.0, 10.0),
            category = Category(5, "Masakan Indonesia", "masakan-indonesia")
        ),
        Recipe(
            id = 6,
            title = "Rahasia Kaldu Ayam Jernih (Consommé)",
            slug = "rahasia-kaldu-ayam-jernih-consomme",
            description = "Belajar membuat stok dasar yang jernih tanpa lemak berlebih. Dasar dari semua sup lezat.",
            imageUrl = "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1000",
            difficulty = "Intermediate",
            cookingTime = 240,
            prepTime = 20,
            ingredients = listOf(
                Ingredient("Tulang Ayam Bersih", "1", "kg"),
                Ingredient("Air Es/Dingin", "3", "Liter"),
                Ingredient("Bawang Bombay & Wortel", "200", "gram"),
                Ingredient("Batang Seledri", "2", "batang"),
                Ingredient("Merica Butiran", "5", "butir")
            ),
            steps = listOf(
                "Cold Start Method: Masukkan tulang ayam ke panci berisi air DINGIN. Panaskan perlahan dengan api sedang. Ini penting agar protein darah keluar perlahan dan tidak membuat kaldu keruh.",
                "Skimming: Saat mulai mendidih, akan muncul buih putih di permukaan. Buang buih tersebut menggunakan sendok sayur secara rutin. Jangan biarkan buih tercampur kembali ke air.",
                "Simmering: Kecilkan api ke tingkat paling rendah. Biarkan mendidih halus (hanya muncul gelembung kecil sesekali) selama 3 jam. Tambahkan sayuran di 1 jam terakhir.",
                "Straining: Saring kaldu menggunakan kain kasa atau saringan halus. Jangan menekan tulang/sayuran agar kaldu tetap jernih seperti kristal."
            ),
            nutritionalInfo = NutritionInfo(60, 7.0, 0.0, 3.0),
            category = Category(4, "Sup & Kaldu", "sup-dan-kaldu")
        )
    )

    private val fallbackRecipes: List<Recipe> = buildLocalDummyRecipes()

    override fun getRecipes(
        categoryId: Int?,
        search: String?,
        forceRefresh: Boolean
    ): Flow<Result<List<Recipe>>> = flow {
        if (useLocalDummyOnly) {
            val favoriteIds = recipeDao.getFavoriteRecipes().map { it.id }.toSet()
            val local = filterLocalRecipes(categoryId, search).map { it.copy(isFavorite = favoriteIds.contains(it.id)) }
            if (search.isNullOrEmpty()) {
                recipeDao.insertRecipes(local.map { it.toEntity() })
            }
            emit(Result.success(local))
            return@flow
        }

        // First try local cache
        if (!forceRefresh && search.isNullOrEmpty()) {
            val localRecipes = if (categoryId != null) {
                recipeDao.getRecipesByCategory(categoryId.toString())
            } else {
                recipeDao.getAllRecipes()
            }
            if (localRecipes.isNotEmpty()) {
                emit(Result.success(localRecipes.map { it.toModel() }))
            }
        }

        // Try loading from Network
        try {
            val response = apiService.getRecipes(
                categoryId = categoryId,
                search = search,
                perPage = 100,
                sortBy = "created_at",
                sortDir = "desc"
            )
            
            if (response.isSuccessful) {
                response.body()?.data?.let { recipes ->
                    if (recipes.isNotEmpty()) {
                        val favoriteIds = recipeDao.getFavoriteRecipes().map { it.id }.toSet()
                        val recipesWithFavorite = recipes.map { it.copy(isFavorite = favoriteIds.contains(it.id)) }
                        if (search.isNullOrEmpty()) {
                            recipeDao.insertRecipes(
                                recipesWithFavorite.map {
                                    it.toEntity().copy(isFavorite = favoriteIds.contains(it.id))
                                }
                            )
                        }
                        emit(Result.success(recipesWithFavorite))
                    } else {
                        // API succeeded but returned empty. Return our rich high-fidelity fallback recipes!
                        val filteredFallback = filterLocalRecipes(categoryId, search)
                        emit(Result.success(filteredFallback))
                    }
                } ?: emit(Result.success(filterLocalRecipes(categoryId, search)))
            } else {
                // If API fails, emit fallback tutorials directly
                val filteredFallback = filterLocalRecipes(categoryId, search)
                emit(Result.success(filteredFallback))
            }
        } catch (e: Exception) {
            // Emitting fallback on connection error so user never sees an empty screen!
            val filteredFallback = filterLocalRecipes(categoryId, search)
            emit(Result.success(filteredFallback))
        }
    }

    override fun getRecipeDetail(id: Int, forceRefresh: Boolean): Flow<Result<Recipe>> = flow {
        if (useLocalDummyOnly) {
            val favorite = recipeDao.getRecipeById(id)?.isFavorite ?: false
            val local = fallbackRecipes.find { it.id == id }
            if (local != null) {
                emit(Result.success(local.copy(isFavorite = favorite)))
            } else {
                emit(Result.failure(Exception("Resep tidak ditemukan")))
            }
            return@flow
        }

        // Emit local detail first
        val localDetail = recipeDetailDao.getRecipeDetail(id)
        if (localDetail != null) {
            val ingredients = recipeDetailDao.getIngredients(id)
            val steps = recipeDetailDao.getCookingSteps(id)
            val nutrition = recipeDetailDao.getNutritionInfo(id)
            emit(Result.success(localDetail.toModel(ingredients, steps, nutrition)))
        } else {
            // If not found in cache, check fallbacks
            val fallback = fallbackRecipes.find { it.id == id }
            if (fallback != null) {
                emit(Result.success(fallback))
            }
        }

        try {
            val response = apiService.getRecipeById(id)
            if (response.isSuccessful) {
                response.body()?.data?.let { recipe ->
                    val localFavorite = recipeDao.getRecipeById(id)?.isFavorite ?: false
                    val recipeWithFavorite = recipe.copy(isFavorite = localFavorite)
                    val detailEntity = recipe.toDetailEntity()
                    val ingredientEntities = recipeWithFavorite.ingredients?.map { it.toEntity(id) } ?: emptyList()
                    val stepEntities = recipeWithFavorite.steps?.mapIndexed { index, step -> step.toCookingStepEntity(id, index + 1) } ?: emptyList()
                    val nutritionEntity = recipeWithFavorite.nutritionalInfo?.let {
                        com.example.cookedu.data.local.entities.NutritionInfoEntity(
                            recipeId = id,
                            calories = it.calories ?: 0,
                            protein = it.protein?.toInt() ?: 0,
                            carbs = it.carbs?.toInt() ?: 0,
                            fat = it.fat?.toInt() ?: 0
                        )
                    }

                    recipeDetailDao.insertCompleteRecipeDetail(
                        recipeDetail = detailEntity,
                        ingredients = ingredientEntities,
                        steps = stepEntities,
                        nutritionInfo = nutritionEntity ?: com.example.cookedu.data.local.entities.NutritionInfoEntity(recipeId = id, calories = 0, protein = 0, carbs = 0, fat = 0),
                        tags = emptyList()
                    )
                    emit(Result.success(recipeWithFavorite))
                } ?: emit(Result.failure(Exception("Empty response body")))
            } else {
                val fallback = fallbackRecipes.find { it.id == id }
                if (fallback != null) {
                    emit(Result.success(fallback))
                } else {
                    emit(Result.failure(Exception("API Error: ${response.message()}")))
                }
            }
        } catch (e: Exception) {
            val fallback = fallbackRecipes.find { it.id == id }
            if (fallback != null) {
                emit(Result.success(fallback))
            } else {
                emit(Result.failure(e))
            }
        }
    }

    override suspend fun getCategories(): Result<List<Category>> {
        if (useLocalDummyOnly) {
            val categories = fallbackRecipes.mapNotNull { it.category }.distinctBy { it.id }
            return Result.success(categories)
        }

        return try {
            val response = apiService.getCategories()
            if (response.isSuccessful) {
                response.body()?.data?.let {
                    Result.success(it)
                } ?: Result.success(listOf(
                    Category(1, "Teknik Dasar", "teknik-dasar"),
                    Category(2, "Sayuran", "sayuran"),
                    Category(4, "Sup & Kaldu", "sup-dan-kaldu"),
                    Category(5, "Masakan Indonesia", "masakan-indonesia")
                ))
            } else {
                Result.success(listOf(
                    Category(1, "Teknik Dasar", "teknik-dasar"),
                    Category(2, "Sayuran", "sayuran"),
                    Category(4, "Sup & Kaldu", "sup-dan-kaldu"),
                    Category(5, "Masakan Indonesia", "masakan-indonesia")
                ))
            }
        } catch (e: Exception) {
            Result.success(listOf(
                Category(1, "Teknik Dasar", "teknik-dasar"),
                Category(2, "Sayuran", "sayuran"),
                Category(4, "Sup & Kaldu", "sup-dan-kaldu"),
                Category(5, "Masakan Indonesia", "masakan-indonesia")
            ))
        }
    }

    override suspend fun getFavoriteRecipes(): List<Recipe> {
        return recipeDao.getFavoriteRecipes().map { it.toModel().withFallbackVisuals() }
    }

    override suspend fun toggleFavorite(recipe: Recipe, isFavorite: Boolean) {
        val existing = recipeDao.getRecipeById(recipe.id)
        if (existing == null) {
            // Ensure favorites also work for recipes not cached yet.
            recipeDao.insertRecipe(
                recipe.toEntity().copy(
                    isFavorite = isFavorite,
                    createdAt = System.currentTimeMillis()
                )
            )
        } else {
            recipeDao.updateFavoriteStatus(recipe.id, isFavorite)
        }
    }

    override suspend fun getRecipesPage(
        page: Int,
        categoryId: Int?,
        search: String?,
        perPage: Int
    ): Result<RecipePageResult> {
        if (useLocalDummyOnly) {
            val favoriteIds = recipeDao.getFavoriteRecipes().map { it.id }.toSet()
            val fallbackPage = buildFallbackPageResult(page, categoryId, search, perPage, favoriteIds)

            if (search.isNullOrEmpty()) {
                recipeDao.insertRecipes(fallbackPage.recipes.map { it.toEntity() })
            }

            return Result.success(fallbackPage)
        }

        return try {
            val response = apiService.getRecipes(
                categoryId = categoryId,
                search = search,
                page = page,
                perPage = perPage,
                sortBy = "created_at",
                sortDir = "desc"
            )

            if (!response.isSuccessful) {
                return if (page == 1) {
                    Result.success(buildFallbackPageResult(page, categoryId, search, perPage))
                } else {
                    Result.failure(Exception("Gagal memuat resep halaman $page (${response.code()})"))
                }
            }

            val body = response.body() ?: return if (page == 1) {
                Result.success(buildFallbackPageResult(page, categoryId, search, perPage))
            } else {
                Result.failure(Exception("Response kosong"))
            }
            val favoriteIds = recipeDao.getFavoriteRecipes().map { it.id }.toSet()
            val recipesWithFavorite = body.data.map { it.copy(isFavorite = favoriteIds.contains(it.id)) }

            if (recipesWithFavorite.isEmpty()) {
                return if (page == 1) {
                    Result.success(buildFallbackPageResult(page, categoryId, search, perPage, favoriteIds))
                } else {
                    Result.success(
                        RecipePageResult(
                            recipes = emptyList(),
                            currentPage = page,
                            lastPage = page,
                            total = 0
                        )
                    )
                }
            }

            if (search.isNullOrEmpty()) {
                recipeDao.insertRecipes(recipesWithFavorite.map { it.toEntity() })
            }

            val current = body.meta?.currentPage ?: page
            val last = body.meta?.lastPage ?: page
            val total = body.meta?.total ?: recipesWithFavorite.size
            Result.success(
                RecipePageResult(
                    recipes = recipesWithFavorite,
                    currentPage = current,
                    lastPage = last,
                    total = total
                )
            )
        } catch (e: Exception) {
            if (page == 1) {
                Result.success(buildFallbackPageResult(page, categoryId, search, perPage))
            } else {
                Result.failure(e)
            }
        }
    }

    private fun filterLocalRecipes(categoryId: Int?, search: String?): List<Recipe> {
        return fallbackRecipes.filter { recipe ->
            val categoryMatch = categoryId == null || recipe.category?.id == categoryId
            val searchMatch = search.isNullOrBlank() ||
                recipe.title.contains(search, ignoreCase = true) ||
                (recipe.description?.contains(search, ignoreCase = true) == true) ||
                recipe.ingredients?.any { it.item.contains(search, ignoreCase = true) } == true
            categoryMatch && searchMatch
        }
    }

    private fun Recipe.withFallbackVisuals(): Recipe {
        val fallback = fallbackRecipes.firstOrNull { fallback ->
            fallback.id == id || fallback.title.equals(title, ignoreCase = true)
        }
        val needsImageRepair = imageUrl.isNullOrBlank() ||
            imageUrl.contains("source.unsplash.com", ignoreCase = true)

        return copy(
            imageUrl = if (needsImageRepair) fallback?.imageUrl ?: imageUrl else imageUrl,
            description = description ?: fallback?.description,
            difficulty = difficulty ?: fallback?.difficulty,
            cookingTime = cookingTime ?: fallback?.cookingTime,
            prepTime = prepTime ?: fallback?.prepTime,
            nutritionalInfo = nutritionalInfo ?: fallback?.nutritionalInfo,
            category = category ?: fallback?.category
        )
    }

    private suspend fun buildFallbackPageResult(
        page: Int,
        categoryId: Int?,
        search: String?,
        perPage: Int
    ): RecipePageResult {
        val favoriteIds = recipeDao.getFavoriteRecipes().map { it.id }.toSet()
        return buildFallbackPageResult(page, categoryId, search, perPage, favoriteIds)
    }

    private fun buildFallbackPageResult(
        page: Int,
        categoryId: Int?,
        search: String?,
        perPage: Int,
        favoriteIds: Set<Int>
    ): RecipePageResult {
        val filtered = filterLocalRecipes(categoryId, search)
            .map { it.copy(isFavorite = favoriteIds.contains(it.id)) }
        val safePerPage = perPage.coerceAtLeast(1)
        val lastPage = if (filtered.isEmpty()) 1 else ((filtered.size + safePerPage - 1) / safePerPage)
        val safePage = page.coerceAtLeast(1).coerceAtMost(lastPage)
        val fromIndex = ((safePage - 1) * safePerPage).coerceAtLeast(0)
        val toIndex = (fromIndex + safePerPage).coerceAtMost(filtered.size)
        val pageItems = if (fromIndex < filtered.size) filtered.subList(fromIndex, toIndex) else emptyList()

        return RecipePageResult(
            recipes = pageItems,
            currentPage = safePage,
            lastPage = lastPage,
            total = filtered.size
        )
    }

    private fun buildLocalDummyRecipes(): List<Recipe> {
        val categoryIndonesia = Category(5, "Masakan Indonesia", "masakan-indonesia")
        val categoryAsia = Category(4, "Masakan Asia", "masakan-asia")
        val categoryWestern = Category(6, "Western", "western")
        val categoryHealthy = Category(7, "Healthy Food", "healthy-food")

        val titles = listOf(
            "Nasi Goreng Kampung", "Rendang Daging Sapi", "Soto Ayam Lamongan", "Rawon Surabaya",
            "Gudeg Jogja", "Gado-Gado Jakarta", "Nasi Uduk Betawi", "Pempek Palembang",
            "Mie Aceh Tumis", "Ayam Betutu Bali", "Sate Lilit Bali", "Nasi Liwet Solo",
            "Sop Buntut Jakarta", "Tongseng Kambing Solo", "Semur Daging Betawi", "Asinan Bogor",
            "Lontong Sayur Padang", "Coto Makassar", "Pallubasa Makassar", "Konro Bakar Makassar",
            "Papeda Ikan Kuah Kuning", "Ayam Taliwang Lombok", "Plecing Kangkung", "Nasi Kuning Manado",
            "Bubur Manado Tinutuan", "Ikan Woku Belanga", "Ayam Woku Kemangi", "Sambal Goreng Ati",
            "Opor Ayam Lebaran", "Sayur Asem Sunda", "Karedok Sunda", "Nasi Timbel Komplit",
            "Pepes Ikan Kemangi", "Pecel Madiun", "Lalapan Ayam Goreng", "Bakso Urat Kuah",
            "Mie Kocok Bandung", "Soto Banjar", "Nasi Padang Komplit", "Ayam Pop Padang",
            "Beef Wellington", "Fish and Chips", "Shepherds Pie", "Chicken Pot Pie", "Clam Chowder",
            "Spaghetti Bolognese", "Lasagna Al Forno", "Risotto Mushroom", "Gnocchi Pomodoro",
            "Margherita Pizza", "Paella Valenciana", "Gazpacho Andaluz", "Tortilla Espanola",
            "Coq au Vin", "Beef Bourguignon", "Ratatouille Provencal", "Croque Monsieur",
            "Greek Moussaka", "Chicken Souvlaki", "Shakshuka", "Falafel Tahini Wrap", "Hummus Bowl",
            "Turkish Adana Kebab", "Pide Turkish Pizza", "Butter Chicken", "Chicken Tikka Masala",
            "Palak Paneer", "Biryani Hyderabadi", "Dal Tadka", "Masala Dosa", "Pad Thai",
            "Tom Yum Goong", "Green Curry Thai", "Pho Bo Vietnam", "Banh Mi Chicken",
            "Korean Bibimbap", "Bulgogi Beef", "Kimchi Jjigae", "Japanese Ramen Shoyu",
            "Chicken Katsu Curry", "Okonomiyaki Osaka", "Sushi Salmon Roll", "Mapo Tofu",
            "Kung Pao Chicken", "Peking Duck", "Xiao Long Bao", "Hong Kong Wonton Noodle",
            "Mexican Tacos Al Pastor", "Chicken Quesadilla", "Beef Burrito Bowl", "Chili Con Carne",
            "Brazilian Feijoada", "Argentinian Asado", "Peruvian Lomo Saltado", "Cuban Ropa Vieja",
            "Jamaican Jerk Chicken", "Moroccan Chicken Tagine", "South African Bobotie", "Ethiopian Doro Wat"
        )

        val foodImages = listOf(
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=800",
            "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&q=80&w=800"
        )

        return titles.mapIndexed { index, title ->
            val category = when {
                index < 40 -> categoryIndonesia
                index < 70 -> categoryWestern
                index < 95 -> categoryAsia
                else -> categoryHealthy
            }
            Recipe(
                id = index + 1,
                title = title,
                slug = title.lowercase().replace(" ", "-"),
                description = "Resep $title versi CookEdu dengan langkah praktis dan rasa autentik.",
                imageUrl = foodImages[index % foodImages.size],
                difficulty = listOf("beginner", "intermediate", "advanced")[index % 3],
                cookingTime = 20 + (index % 60),
                prepTime = 10 + (index % 20),
                ingredients = listOf(
                    Ingredient("Protein utama", "300", "gram"),
                    Ingredient("Bumbu rempah", "2", "sdm"),
                    Ingredient("Sayuran segar", "150", "gram")
                ),
                steps = listOf(
                    "Siapkan seluruh bahan dan cuci bersih.",
                    "Tumis bumbu hingga harum, lalu masukkan bahan utama.",
                    "Masak hingga matang merata, koreksi rasa, dan sajikan hangat."
                ),
                nutritionalInfo = NutritionInfo(
                    calories = 250 + (index % 400),
                    protein = 14.0 + (index % 18),
                    carbs = 18.0 + (index % 55),
                    fat = 8.0 + (index % 20)
                ),
                category = category
            )
        }
    }
}
