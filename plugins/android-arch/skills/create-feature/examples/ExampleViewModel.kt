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

    override fun obtainEvent(viewEvent: ExampleViewEvent) {
        when (viewEvent) {
            is ExampleViewEvent.LoadData -> loadData()
            is ExampleViewEvent.OnItemClicked -> onItemClicked(viewEvent.itemId)
        }
    }

    private fun loadData() {
        viewModelScope.launch {
            viewState = viewState.copy(isLoading = true, error = null)

            val result = getExampleDataUseCase.execute(Unit)

            result.fold(
                onSuccess = { data ->
                    viewState = viewState.copy(
                        isLoading = false,
                        title = data.title
                    )
                },
                onFailure = { error ->
                    viewState = viewState.copy(
                        isLoading = false,
                        error = error.message
                    )
                }
            )
        }
    }

    private fun onItemClicked(itemId: String) {
        viewAction = ExampleViewAction.NavigateToDetail(itemId)
    }
}
