package com.payrep

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
open class PaymentDataAggregationApplication

fun main(args: Array<String>) {
    runApplication<PaymentDataAggregationApplication>(*args)
}
