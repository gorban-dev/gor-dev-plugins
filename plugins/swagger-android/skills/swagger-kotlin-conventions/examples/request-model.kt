// =============================================================================
// Example: Request model — Data layer ONLY (no Domain, no Mapper)
// Feature: catalog
// Swagger model name: CreateProductRequest
// =============================================================================

// =============================================================================
// FILE 1: KtorCreateProductRequest.kt
// Path: app/src/main/java/com/company/app/feature/catalog/data/model/KtorCreateProductRequest.kt
// =============================================================================

package com.company.app.feature.catalog.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Request body for creating a new product
 */
@Serializable
data class KtorCreateProductRequest(
    /** Product display name */
    @SerialName("name") val name: String,
    @SerialName("price") val price: Double,
    /** Optional product description */
    @SerialName("description") val description: String? = null,
    @SerialName("category_id") val categoryId: Int,
    @SerialName("tags") val tags: List<String> = emptyList(),
    /** Initial product status */
    @SerialName("status") val status: KtorProductStatus
)

// =============================================================================
// NOTE: For request models —
//   - NO Domain model (Product.kt equivalent is NOT created)
//   - NO Mapper (KtorCreateProductRequestMapper.kt is NOT created)
//   - Only this single Data file is generated
// =============================================================================


// =============================================================================
// Example: Request model with nested inline object
// Swagger: UpdateCartItemRequest with inline "options" object
// =============================================================================

// =============================================================================
// FILE: KtorUpdateCartItemRequest.kt
// Path: app/src/main/java/com/company/app/feature/cart/data/model/KtorUpdateCartItemRequest.kt
// =============================================================================

package com.company.app.feature.cart.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class KtorUpdateCartItemRequest(
    @SerialName("product_id") val productId: Int,
    @SerialName("quantity") val quantity: Int,
    @SerialName("options") val options: KtorUpdateCartItemRequestOptions? = null
)

// =============================================================================
// FILE: KtorUpdateCartItemRequestOptions.kt
// Inline nested object — extracted as separate file
// Path: app/src/main/java/com/company/app/feature/cart/data/model/KtorUpdateCartItemRequestOptions.kt
// =============================================================================

package com.company.app.feature.cart.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class KtorUpdateCartItemRequestOptions(
    @SerialName("gift_wrap") val giftWrap: Boolean,
    @SerialName("note") val note: String? = null
)
