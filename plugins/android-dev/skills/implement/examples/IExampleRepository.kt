package com.company.app.feature.example.domain.repository

import com.company.app.feature.example.domain.usecase.ExampleData

interface IExampleRepository {
    suspend fun getExampleData(): ExampleData
}
