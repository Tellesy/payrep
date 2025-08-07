package com.payrep.controller

import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/bi")
@PreAuthorize("hasRole('ADMIN')")
class BusinessIntelligenceControllerTemp {
    
    @GetMapping("/process-reports")
    fun processReports(
        @RequestParam("directory", defaultValue = "sample-data/reports") directory: String
    ): ResponseEntity<Map<String, Any>> {
        // Temporary implementation - return success without actual processing
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "Report processing temporarily disabled - core seeding functionality prioritized",
            "processedCount" to 0
        ))
    }
    
    @GetMapping("/transaction-volume")
    fun getTransactionVolumeData(
        @RequestParam("startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam("endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?,
        @RequestParam("institution", required = false) institution: String?
    ): ResponseEntity<Map<String, Any>> {
        // Temporary implementation - return empty chart data
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "Transaction volume reporting temporarily disabled",
            "chartData" to emptyList<Any>(),
            "totalTransactions" to 0,
            "totalAmount" to 0.0
        ))
    }
    
    @GetMapping("/atm-transactions")
    @PreAuthorize("hasRole('ADMIN')")
    fun getATMTransactionAnalytics(
        @RequestParam("startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam("endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?,
        @RequestParam("institution", required = false) institution: String?
    ): ResponseEntity<Map<String, Any>> {
        // Temporary implementation - return empty analytics
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "ATM transaction analytics temporarily disabled",
            "totalTransactions" to 0,
            "topATMs" to emptyList<Any>(),
            "chartData" to emptyList<Any>()
        ))
    }
    
    @GetMapping("/pos-transactions")
    @PreAuthorize("hasRole('ADMIN')")
    fun getPOSTransactionAnalytics(
        @RequestParam("startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam("endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?,
        @RequestParam("institution", required = false) institution: String?
    ): ResponseEntity<Map<String, Any>> {
        // Temporary implementation - return empty analytics
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "POS transaction analytics temporarily disabled",
            "totalTerminals" to 0,
            "activeTerminals" to 0,
            "topMCCs" to emptyList<Any>(),
            "chartData" to emptyList<Any>()
        ))
    }
    
    @GetMapping("/ecommerce-activity")
    @PreAuthorize("hasRole('ADMIN')")
    fun getECommerceActivityAnalytics(
        @RequestParam("startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam("endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?
    ): ResponseEntity<Map<String, Any>> {
        // Temporary implementation - return empty analytics
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "E-commerce activity analytics temporarily disabled",
            "totalActivity" to 0,
            "chartData" to emptyList<Any>()
        ))
    }
}
