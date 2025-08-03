package com.payrep.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.jdbc.datasource.DriverManagerDataSource

@Configuration
class DataSourceConfig {
    @Bean
    fun dataSource(): DriverManagerDataSource {
        val dataSource = DriverManagerDataSource()
        dataSource.driverClassName = "org.postgresql.Driver"
        dataSource.url = "jdbc:postgresql://localhost:5432/payment_data"
        dataSource.username = "postgres"
        dataSource.password = "postgres"
        return dataSource
    }
}
