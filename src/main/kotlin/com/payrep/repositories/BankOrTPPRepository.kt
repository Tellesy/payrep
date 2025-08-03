package com.payrep.repositories

import com.payrep.entities.BankOrTPP
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface BankOrTPPRepository : JpaRepository<BankOrTPP, Long> {
    fun findByCode(code: String): BankOrTPP?
    fun findByType(type: BankOrTPP.Type): List<BankOrTPP>
}
