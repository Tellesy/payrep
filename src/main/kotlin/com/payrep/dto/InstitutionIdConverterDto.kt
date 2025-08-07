package com.payrep.dto

data class InstitutionIdConverterDto(
    val id: Long? = null,
    val sourceInstitutionId: String,
    val targetBankOrTppCode: String,
    val processorCode: String,
    val description: String? = null
)
