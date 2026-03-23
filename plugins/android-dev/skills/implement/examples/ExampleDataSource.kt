package com.company.app.feature.example.data.datasource

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get

class ExampleRemoteDataSource(
    private val httpClient: HttpClient
) {

    suspend fun fetchExampleData(): ExampleResponse {
        return httpClient.get("/api/example").body()
    }
}
