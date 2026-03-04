package com.company.app.feature.example.presentation.viewmodel

sealed class ExampleViewEvent {
    data object LoadData : ExampleViewEvent()
    data class OnItemClicked(val itemId: String) : ExampleViewEvent()
}
