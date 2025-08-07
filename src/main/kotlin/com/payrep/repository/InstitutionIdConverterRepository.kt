package com.payrep.repository

import com.payrep.domain.InstitutionIdConverter
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface InstitutionIdConverterRepository : JpaRepository<InstitutionIdConverter, Long> {
    
    fun findBySourceInstitutionIdAndProcessorCode(
        sourceInstitutionId: String,
        processorCode: String
    ): InstitutionIdConverter?
    
    fun findBySourceInstitutionIdAndProcessorCodeAndIsActive(
        sourceInstitutionId: String,
        processorCode: String,
        isActive: Boolean = true
    ): InstitutionIdConverter?
    
    fun findByProcessorCodeAndIsActive(
        processorCode: String,
        isActive: Boolean = true
    ): List<InstitutionIdConverter>
    
    @Query("SELECT c FROM InstitutionIdConverter c WHERE c.targetBankOrTppCode = :targetCode AND c.isActive = true")
    fun findByTargetBankOrTppCode(targetCode: String): List<InstitutionIdConverter>
}
