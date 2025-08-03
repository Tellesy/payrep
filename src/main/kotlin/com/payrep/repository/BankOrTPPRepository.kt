package com.payrep.repository

import com.payrep.domain.BankOrTPP
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface BankOrTPPRepository : JpaRepository<BankOrTPP, Long> {
    fun findByCode(code: String): BankOrTPP?
    fun findByType(type: BankOrTPP.BankOrTPPType): List<BankOrTPP>
}
