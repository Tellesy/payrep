package com.payrep.controller

import com.payrep.service.ReportServiceSimple
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/test")
class TestController(
    private val reportService: ReportServiceSimple
) {
    
    @GetMapping("/bi-data")
    fun testBiData(): ResponseEntity<Map<String, Any>> {
        val startDate = LocalDate.of(2025, 6, 1)
        val endDate = LocalDate.of(2025, 6, 30)
        
        val transactionData = reportService.getTransactionVolumeChartData(startDate, endDate)
        val atmData = reportService.getATMTransactionAnalytics(startDate, endDate)
        
        return ResponseEntity.ok(mapOf(
            "transactionVolume" to transactionData,
            "atmTransactions" to atmData,
            "message" to "Test endpoint - no auth required"
        ))
    }
}
