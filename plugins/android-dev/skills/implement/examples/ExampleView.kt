package com.company.app.feature.example.presentation.view

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.company.app.feature.example.presentation.viewmodel.ExampleViewEvent
import com.company.app.feature.example.presentation.viewmodel.ExampleViewState

@Composable
fun ExampleView(
    viewState: ExampleViewState,
    eventHandler: (ExampleViewEvent) -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        when {
            viewState.isLoading -> {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center)
                )
            }
            viewState.error != null -> {
                Text(
                    text = viewState.error,
                    modifier = Modifier
                        .align(Alignment.Center)
                        .padding(16.dp)
                )
            }
            else -> {
                Column(modifier = Modifier.fillMaxSize()) {
                    Text(text = viewState.title)
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Preview(showBackground = true, uiMode = android.content.res.Configuration.UI_MODE_NIGHT_YES)
@Composable
private fun ExampleViewPreviewLight() {
    ExampleView(
        viewState = ExampleViewState(title = "Example Title"),
        eventHandler = {}
    )
}