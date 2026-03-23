package com.company.app.feature.example.presentation.viewmodel

import androidx.lifecycle.viewModelScope
import com.company.app.common.base.BaseSharedViewModel
import com.company.app.feature.example.domain.usecase.GetExampleDataUseCase
import kotlinx.coroutines.launch

class ExampleViewModel(
    private val getExampleDataUseCase: GetExampleDataUseCase
) : BaseSharedViewModel<ExampleViewState, ExampleViewAction, ExampleViewEvent>(
    initialState = ExampleViewState()
) {

    override fun handleEvent(event: ExampleViewEvent) {
        when (event) {
            is ExampleViewEvent.LoadData -> loadData()
            is ExampleViewEvent.OnItemClicked -> onItemClicked(event.itemId)
        }
    }

    private fun loadData() {
        viewModelScope.launch {
            updateState { it.copy(isLoading = true, error = null) }

            getExampleDataUseCase.execute(Unit).fold(
                onSuccess = { data ->
                    updateState { it.copy(isLoading = false, title = data.title) }
                },
                onFailure = { error ->
                    updateState { it.copy(isLoading = false, error = error.message) }
                }
            )
        }
    }

    private fun onItemClicked(itemId: String) {
        sendAction(ExampleViewAction.NavigateToDetail(itemId))
    }
}
