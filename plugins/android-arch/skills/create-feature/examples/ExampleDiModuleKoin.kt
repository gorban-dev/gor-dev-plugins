package com.company.app.feature.example.di

import com.company.app.feature.example.data.datasource.ExampleRemoteDataSource
import com.company.app.feature.example.data.repository.ExampleRepository
import com.company.app.feature.example.domain.repository.IExampleRepository
import com.company.app.feature.example.domain.usecase.GetExampleDataUseCase
import com.company.app.feature.example.presentation.viewmodel.ExampleViewModel
import org.koin.androidx.viewmodel.dsl.viewModel
import org.koin.dsl.module

val exampleModule = module {
    viewModel { ExampleViewModel(get()) }
    factory { GetExampleDataUseCase(get()) }
    single<IExampleRepository> { ExampleRepository(get()) }
    single { ExampleRemoteDataSource(get()) }
}
