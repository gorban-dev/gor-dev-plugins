package com.company.app.feature.example.presentation.screen

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.company.app.feature.example.presentation.view.ExampleView
import com.company.app.feature.example.presentation.viewmodel.ExampleViewModel

@Composable
fun ExampleScreen(
    viewModel: ExampleViewModel // получение через DI проекта
) {
    val viewState by viewModel.viewStates().collectAsStateWithLifecycle()
    val viewAction by viewModel.viewActions().collectAsStateWithLifecycle(null)

    ExampleView(viewState) { event ->
	viewModel.obtainEvent(event)
     }
}
