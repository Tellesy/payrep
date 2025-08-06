package com.payrep.controller

import com.payrep.service.ReportService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/bi")
@PreAuthorize("hasRole('ADMIN')")
class BusinessIntelligenceController(
    private val reportService: ReportService
) {
    
    @GetMapping("/process-reports")
    fun processReports(
        @RequestParam("directory", defaultValue = "sample-data/reports") directory: String
    ): ResponseEntity<Map<String, Any>> {
        val processedCount = reportService.processReportsFromDirectory(directory)
        return ResponseEntity.ok(mapOf(
            "success" to true,
            "message" to "Processed $processedCount reports",
            "processedCount" to processedCount
        ))
    }
    
    @GetMapping("/transaction-volume")
    fun getTransactionVolumeData(
        @RequestParam("startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam("endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?
    ): ResponseEntity<Map<String, Any>> {
        val start = startDate ?: LocalDate.now().minusMonths(1)
        val end = endDate ?: LocalDate.now()
        
        val chartData = reportService.getTransactionVolumeChartData(start, end)
        return ResponseEntity.ok(chartData)
    }
    
    @GetMapping("/atm-transactions")
    @PreAuthorize("hasRole('ADMIN')")
    fun getATMTransactionAnalytics(
        @RequestParam("startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam("endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?
    ): ResponseEntity<Map<String, Any>> {
        val start = startDate ?: LocalDate.now().minusMonths(1)
        val end = endDate ?: LocalDate.now()
        
        val data = reportService.getATMTransactionAnalytics(start, end)
        return ResponseEntity.ok(data)
    }
    
    @GetMapping("/pos-terminals")
    @PreAuthorize("hasRole('ADMIN')")
    fun getPOSTerminalAnalytics(
        @RequestParam("startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate?,
        @RequestParam("endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate?
    ): ResponseEntity<Map<String, Any>> {
        val start = startDate ?: LocalDate.now().minusMonths(1)
        val end = endDate ?: LocalDate.now()
        
        val data = reportService.getPOSTerminalAnalytics(start, end)
        return ResponseEntity.ok(data)
    }
    
    @GetMapping("/report-summary")
    fun getReportSummary(): ResponseEntity<Map<String, Any>> {
        // Return a summary of all available reports by type and date range
        return ResponseEntity.ok(mapOf(
            "availableReportTypes" to listOf("TRANSACTION_VOLUME", "ATM_TRANSACTION", "POS_TERMINAL"),
            "dataAvailableFrom" to LocalDate.now().minusMonths(1),
            "dataAvailableTo" to LocalDate.now()
        ))
    }
}
