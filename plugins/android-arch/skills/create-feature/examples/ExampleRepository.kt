package com.company.app.feature.example.data.repository

import com.company.app.feature.example.data.datasource.ExampleRemoteDataSource
import com.company.app.feature.example.domain.repository.IExampleRepository
import com.company.app.feature.example.domain.usecase.ExampleData

class ExampleRepository(
    private val remoteDataSource: ExampleRemoteDataSource
) : IExampleRepository {

    override suspend fun getExampleData(): ExampleData {
        val response = remoteDataSource.fetchExampleData()
        return ExampleData(title = response.title)
    }
}
