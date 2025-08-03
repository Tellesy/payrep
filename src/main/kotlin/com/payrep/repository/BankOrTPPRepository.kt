package com.payrep.repository

import com.payrep.domain.BankOrTPP
import com.payrep.domain.BankOrTPPType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface BankOrTPPRepository : JpaRepository<BankOrTPP, Long> {
    fun findByCode(code: String): BankOrTPP?
    fun findByType(type: BankOrTPPType): List<BankOrTPP>
}
