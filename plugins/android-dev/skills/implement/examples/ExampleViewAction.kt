package com.company.app.feature.example.presentation.viewmodel

sealed class ExampleViewAction {
    data class NavigateToDetail(val itemId: String) : ExampleViewAction()
    data class ShowError(val message: String) : ExampleViewAction()
}
