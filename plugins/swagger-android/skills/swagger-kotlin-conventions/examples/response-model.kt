// =============================================================================
// Example: Response model — full 3-layer stack (Data + Domain + Mapper)
// Feature: catalog
// Swagger model name: Product
// =============================================================================

// =============================================================================
// FILE 1: KtorProduct.kt
// Path: app/src/main/java/com/company/app/feature/catalog/data/model/KtorProduct.kt
// =============================================================================

package com.company.app.feature.catalog.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Product entity from the catalog
 */
@Serializable
data class KtorProduct(
    /** Unique product identifier */
    @SerialName("id") val id: Int,
    /** Display name of the product */
    @SerialName("product_name") val productName: String,
    /** Optional product description */
    @SerialName("description") val description: String? = null,
    @SerialName("price") val price: Double,
    @SerialName("rating") val rating: Float,
    @SerialName("in_stock") val inStock: Boolean,
    @SerialName("stock_count") val stockCount: Long,
    /** Product category */
    @SerialName("category") val category: KtorCategory,
    /** Optional promotional category */
    @SerialName("promo_category") val promoCategory: KtorCategory? = null,
    /** Search tags */
    @SerialName("tags") val tags: List<String> = emptyList(),
    @SerialName("images") val images: List<KtorProductImage> = emptyList(),
    /** Creation timestamp in ISO 8601 */
    @SerialName("created_at") val createdAt: String,
    /** Current product status */
    @SerialName("status") val status: KtorProductStatus
)

// =============================================================================
// FILE 2: KtorCategory.kt
// Path: app/src/main/java/com/company/app/feature/catalog/data/model/KtorCategory.kt
// =============================================================================

package com.company.app.feature.catalog.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class KtorCategory(
    @SerialName("id") val id: Int,
    /** Category display name */
    @SerialName("name") val name: String,
    @SerialName("slug") val slug: String? = null
)

// =============================================================================
// FILE 3: KtorProductImage.kt
// Path: app/src/main/java/com/company/app/feature/catalog/data/model/KtorProductImage.kt
// =============================================================================

package com.company.app.feature.catalog.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class KtorProductImage(
    @SerialName("url") val url: String,
    /** Whether this is the primary image */
    @SerialName("is_primary") val isPrimary: Boolean,
    @SerialName("alt_text") val altText: String? = null
)

// =============================================================================
// FILE 4: KtorProductStatus.kt
// Path: app/src/main/java/com/company/app/feature/catalog/data/model/KtorProductStatus.kt
// =============================================================================

package com.company.app.feature.catalog.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Possible product statuses
 */
@Serializable
enum class KtorProductStatus {
    @SerialName("active") ACTIVE,
    @SerialName("archived") ARCHIVED,
    @SerialName("draft") DRAFT,
    UNKNOWN
}

// =============================================================================
// FILE 5: Product.kt  (Domain)
// Path: app/src/main/java/com/company/app/feature/catalog/domain/model/Product.kt
// =============================================================================

package com.company.app.feature.catalog.domain.model

/**
 * Product entity from the catalog
 */
data class Product(
    /** Unique product identifier */
    val id: Int,
    /** Display name of the product */
    val productName: String,
    /** Optional product description */
    val description: String?,
    val price: Double,
    val rating: Float,
    val inStock: Boolean,
    val stockCount: Long,
    /** Product category */
    val category: Category,
    /** Optional promotional category */
    val promoCategory: Category?,
    /** Search tags */
    val tags: List<String>,
    val images: List<ProductImage>,
    /** Creation timestamp in ISO 8601 */
    val createdAt: String,
    /** Current product status */
    val status: ProductStatus
)

// =============================================================================
// FILE 6: Category.kt  (Domain)
// Path: app/src/main/java/com/company/app/feature/catalog/domain/model/Category.kt
// =============================================================================

package com.company.app.feature.catalog.domain.model

data class Category(
    val id: Int,
    /** Category display name */
    val name: String,
    val slug: String?
)

// =============================================================================
// FILE 7: ProductImage.kt  (Domain)
// Path: app/src/main/java/com/company/app/feature/catalog/domain/model/ProductImage.kt
// =============================================================================

package com.company.app.feature.catalog.domain.model

data class ProductImage(
    val url: String,
    /** Whether this is the primary image */
    val isPrimary: Boolean,
    val altText: String?
)

// =============================================================================
// FILE 8: ProductStatus.kt  (Domain)
// Path: app/src/main/java/com/company/app/feature/catalog/domain/model/ProductStatus.kt
// =============================================================================

package com.company.app.feature.catalog.domain.model

/**
 * Possible product statuses
 */
enum class ProductStatus {
    ACTIVE,
    ARCHIVED,
    DRAFT,
    UNKNOWN
}

// =============================================================================
// FILE 9: KtorProductMapper.kt
// Path: app/src/main/java/com/company/app/feature/catalog/data/model/KtorProductMapper.kt
// =============================================================================

package com.company.app.feature.catalog.data.model

import com.company.app.feature.catalog.domain.model.Product

fun KtorProduct.toDomain(): Product = Product(
    id = id,
    productName = productName,
    description = description,
    price = price,
    rating = rating,
    inStock = inStock,
    stockCount = stockCount,
    category = category.toDomain(),
    promoCategory = promoCategory?.toDomain(),
    tags = tags,
    images = images.map { it.toDomain() },
    createdAt = createdAt,
    status = status.toDomain()
)

// =============================================================================
// FILE 10: KtorCategoryMapper.kt
// Path: app/src/main/java/com/company/app/feature/catalog/data/model/KtorCategoryMapper.kt
// =============================================================================

package com.company.app.feature.catalog.data.model

import com.company.app.feature.catalog.domain.model.Category

fun KtorCategory.toDomain(): Category = Category(
    id = id,
    name = name,
    slug = slug
)

// =============================================================================
// FILE 11: KtorProductImageMapper.kt
// Path: app/src/main/java/com/company/app/feature/catalog/data/model/KtorProductImageMapper.kt
// =============================================================================

package com.company.app.feature.catalog.data.model

import com.company.app.feature.catalog.domain.model.ProductImage

fun KtorProductImage.toDomain(): ProductImage = ProductImage(
    url = url,
    isPrimary = isPrimary,
    altText = altText
)

// =============================================================================
// FILE 12: KtorProductStatusMapper.kt
// Path: app/src/main/java/com/company/app/feature/catalog/data/model/KtorProductStatusMapper.kt
// =============================================================================

package com.company.app.feature.catalog.data.model

import com.company.app.feature.catalog.domain.model.ProductStatus

fun KtorProductStatus.toDomain(): ProductStatus = when (this) {
    KtorProductStatus.ACTIVE -> ProductStatus.ACTIVE
    KtorProductStatus.ARCHIVED -> ProductStatus.ARCHIVED
    KtorProductStatus.DRAFT -> ProductStatus.DRAFT
    KtorProductStatus.UNKNOWN -> ProductStatus.UNKNOWN
}
