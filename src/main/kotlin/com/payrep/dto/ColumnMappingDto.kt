package com.payrep.dto

import com.payrep.domain.ColumnMapping

data class ColumnMappingDto(
    val id: Long? = null,
    val fileProcessingConfigId: Long,
    val columnName: String,
    val entityType: String,
    val fieldName: String,
    val transformation: String? = null
) {
    companion object {
        fun fromEntity(entity: ColumnMapping) = ColumnMappingDto(
            id = entity.id,
            fileProcessingConfigId = entity.fileProcessingConfig.id!!,
            columnName = entity.columnName,
            entityType = entity.entityType,
            fieldName = entity.fieldName,
            transformation = entity.transformation
        )
    }
}
