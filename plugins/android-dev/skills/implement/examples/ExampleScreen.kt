package com.company.app.feature.example.presentation.screen

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.company.app.common.extensions.CollectWithLifecycle
import com.company.app.feature.example.presentation.view.ExampleView
import com.company.app.feature.example.presentation.viewmodel.ExampleViewModel
import com.company.app.feature.example.presentation.viewmodel.ExampleViewAction

@Composable
fun ExampleScreen(
    viewModel: ExampleViewModel // получение через DI проекта
) {
    val viewState by viewModel.viewStates().collectAsStateWithLifecycle()

    viewModel.viewActions().CollectWithLifecycle { action ->
        when (action) {
            is ExampleViewAction.NavigateBack -> { /* handle navigation */ }
        }
    }

    ExampleView(
        viewState = viewState,
        eventHandler = viewModel::handleEvent
    )
}
