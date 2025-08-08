package com.payrep.repository

import com.payrep.domain.HeaderAlias
import com.payrep.domain.HeaderDefinition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface HeaderAliasRepository : JpaRepository<HeaderAlias, Long> {
    fun findByHeaderDefinition(headerDefinition: HeaderDefinition): List<HeaderAlias>
    fun findByAlias(alias: String): List<HeaderAlias>
}
