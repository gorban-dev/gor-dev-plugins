package com.company.app.feature.example.domain.usecase

import com.company.app.common.domain.UseCase
import com.company.app.feature.example.domain.repository.IExampleRepository

class GetExampleDataUseCase(
    private val repository: IExampleRepository
) : UseCase<Unit, Result<ExampleData>> {

    override suspend fun execute(params: Unit): Result<ExampleData> {
        return try {
            val data = repository.getExampleData()
            Result.success(data)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
