package com.company.app.feature.example.presentation.viewmodel

data class ExampleViewState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val title: String = ""
)
