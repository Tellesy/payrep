package com.payrep.controller

import com.payrep.domain.*
import com.payrep.dto.*
import com.payrep.repository.*
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
class AdminController(
    private val bankRepository: BankOrTPPRepository,
    private val fileConfigRepository: FileProcessingConfigRepository,
    private val columnMappingRepository: ColumnMappingRepository,
    private val importLogRepository: ImportLogRepository
) {

    // Bank/TPP Management
    @GetMapping("/banks")
    fun getAllBanks(): List<BankOrTPPDto> {
        return bankRepository.findAll().map { BankOrTPPDto.fromEntity(it) }
    }

    @PostMapping("/banks")
    fun createBank(@RequestBody dto: BankOrTPPDto): ResponseEntity<BankOrTPPDto> {
        val bank = BankOrTPP(
            code = dto.code,
            name = dto.name,
            type = dto.type
        )
        val saved = bankRepository.save(bank)
        return ResponseEntity.ok(BankOrTPPDto.fromEntity(saved))
    }

    @PutMapping("/banks/{id}")
    fun updateBank(@PathVariable id: Long, @RequestBody dto: BankOrTPPDto): ResponseEntity<BankOrTPPDto> {
        val existing = bankRepository.findById(id).orElseThrow { 
            RuntimeException("Bank/TPP not found with id: $id") 
        }
        
        val updated = existing.copy(
            code = dto.code,
            name = dto.name,
            type = dto.type
        )
        val saved = bankRepository.save(updated)
        return ResponseEntity.ok(BankOrTPPDto.fromEntity(saved))
    }

    @DeleteMapping("/banks/{id}")
    fun deleteBank(@PathVariable id: Long): ResponseEntity<Void> {
        bankRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }

    // File Processing Config Management
    @GetMapping("/file-configs")
    fun getAllFileConfigs(): List<FileProcessingConfigDto> {
        return fileConfigRepository.findAll().map { FileProcessingConfigDto.fromEntity(it) }
    }

    @PostMapping("/file-configs")
    fun createFileConfig(@RequestBody dto: FileProcessingConfigDto): ResponseEntity<FileProcessingConfigDto> {
        val bank = bankRepository.findById(dto.bankOrTPPId).orElseThrow {
            RuntimeException("Bank/TPP not found with id: ${dto.bankOrTPPId}")
        }
        
        val config = FileProcessingConfig(
            bankOrTPP = bank,
            directoryPath = dto.directoryPath,
            fileNamePattern = dto.fileNamePattern,
            scheduleTime = dto.scheduleTime,
            fileType = dto.fileType
        )
        val saved = fileConfigRepository.save(config)
        return ResponseEntity.ok(FileProcessingConfigDto.fromEntity(saved))
    }

    @PutMapping("/file-configs/{id}")
    fun updateFileConfig(@PathVariable id: Long, @RequestBody dto: FileProcessingConfigDto): ResponseEntity<FileProcessingConfigDto> {
        val existing = fileConfigRepository.findById(id).orElseThrow {
            RuntimeException("File config not found with id: $id")
        }
        
        val bank = bankRepository.findById(dto.bankOrTPPId).orElseThrow {
            RuntimeException("Bank/TPP not found with id: ${dto.bankOrTPPId}")
        }
        
        val updated = existing.copy(
            bankOrTPP = bank,
            directoryPath = dto.directoryPath,
            fileNamePattern = dto.fileNamePattern,
            scheduleTime = dto.scheduleTime,
            fileType = dto.fileType
        )
        val saved = fileConfigRepository.save(updated)
        return ResponseEntity.ok(FileProcessingConfigDto.fromEntity(saved))
    }

    @DeleteMapping("/file-configs/{id}")
    fun deleteFileConfig(@PathVariable id: Long): ResponseEntity<Void> {
        fileConfigRepository.deleteById(id)
        return ResponseEntity.noContent().build()
    }

    // Column Mapping Management
    @GetMapping("/file-configs/{configId}/column-mappings")
    fun getColumnMappings(@PathVariable configId: Long): List<ColumnMappingDto> {
        return columnMappingRepository.findByFileProcessingConfigId(configId)
            .map { ColumnMappingDto.fromEntity(it) }
    }

    @PostMapping("/file-configs/{configId}/column-mappings")
    fun createColumnMapping(@PathVariable configId: Long, @RequestBody dto: ColumnMappingDto): ResponseEntity<ColumnMappingDto> {
        val config = fileConfigRepository.findById(configId).orElseThrow {
            RuntimeException("File config not found with id: $configId")
        }
        
        val mapping = ColumnMapping(
            fileProcessingConfig = config,
            columnName = dto.columnName,
            entityType = dto.entityType,
            fieldName = dto.fieldName,
            transformation = dto.transformation
        )
        val saved = columnMappingRepository.save(mapping)
        return ResponseEntity.ok(ColumnMappingDto.fromEntity(saved))
    }

    // Import Log Monitoring
    @GetMapping("/import-logs")
    fun getImportLogs(@RequestParam(required = false) status: String?): List<ImportLog> {
        return if (status != null) {
            val importStatus = ImportLog.ImportStatus.valueOf(status.uppercase())
            importLogRepository.findByStatus(importStatus)
        } else {
            importLogRepository.findAll()
        }
    }

    @GetMapping("/import-logs/config/{configId}")
    fun getImportLogsByConfig(@PathVariable configId: Long): List<ImportLog> {
        return importLogRepository.findByFileProcessingConfigId(configId)
    }
}
