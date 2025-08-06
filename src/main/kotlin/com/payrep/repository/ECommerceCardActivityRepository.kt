package com.payrep.repository

import com.payrep.domain.ECommerceCardActivity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface ECommerceCardActivityRepository : JpaRepository<ECommerceCardActivity, Long> {
    @Query("SELECT e FROM ECommerceCardActivity e WHERE e.report_date BETWEEN :startDate AND :endDate")
    fun findByReportDateBetween(startDate: LocalDate, endDate: LocalDate): List<ECommerceCardActivity>
}
