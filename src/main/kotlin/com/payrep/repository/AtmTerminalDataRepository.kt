package com.payrep.repository

import com.payrep.domain.AtmTerminalData
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface AtmTerminalDataRepository : JpaRepository<AtmTerminalData, Long> {
    @Query("SELECT a FROM AtmTerminalData a WHERE a.report_date BETWEEN :startDate AND :endDate")
    fun findByReportDateBetween(startDate: LocalDate, endDate: LocalDate): List<AtmTerminalData>
}
