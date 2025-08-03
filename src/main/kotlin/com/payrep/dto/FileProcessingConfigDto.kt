package com.payrep.dto

import com.payrep.domain.FileProcessingConfig

data class FileProcessingConfigDto(
    val id: Long? = null,
    val bankOrTPPId: Long,
    val directoryPath: String,
    val fileNamePattern: String,
    val scheduleTime: String,
    val fileType: String
) {
    companion object {
        fun fromEntity(entity: FileProcessingConfig) = FileProcessingConfigDto(
            id = entity.id,
            bankOrTPPId = entity.bankOrTPP.id!!,
            directoryPath = entity.directoryPath,
            fileNamePattern = entity.fileNamePattern,
            scheduleTime = entity.scheduleTime,
            fileType = entity.fileType
        )
    }
}
