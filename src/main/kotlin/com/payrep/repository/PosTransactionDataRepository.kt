package com.payrep.repository

import com.payrep.domain.PosTransactionData
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface PosTransactionDataRepository : JpaRepository<PosTransactionData, Long> {
    @Query("SELECT p FROM PosTransactionData p WHERE p.reportDate BETWEEN :startDate AND :endDate")
    fun findByReportDateBetween(startDate: LocalDate, endDate: LocalDate): List<PosTransactionData>
}
