package com.company.app.feature.example.di

import com.company.app.feature.example.data.datasource.ExampleRemoteDataSource
import com.company.app.feature.example.data.repository.ExampleRepository
import com.company.app.feature.example.domain.repository.IExampleRepository
import com.company.app.feature.example.domain.usecase.GetExampleDataUseCase
import com.company.app.feature.example.presentation.viewmodel.ExampleViewModel
import org.kodein.di.DI
import org.kodein.di.bind
import org.kodein.di.instance
import org.kodein.di.provider
import org.kodein.di.singleton

val exampleModule = DI.Module("exampleModule") {
    bind<ExampleViewModel>() with provider { ExampleViewModel(instance()) }
    bind<GetExampleDataUseCase>() with provider { GetExampleDataUseCase(instance()) }
    bind<IExampleRepository>() with singleton { ExampleRepository(instance()) }
    bind<ExampleRemoteDataSource>() with singleton { ExampleRemoteDataSource(instance()) }
}
