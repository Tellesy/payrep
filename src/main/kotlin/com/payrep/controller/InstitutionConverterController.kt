package com.payrep.controller

import com.payrep.domain.InstitutionIdConverter
import com.payrep.dto.InstitutionIdConverterDto
import com.payrep.repository.InstitutionIdConverterRepository
import com.payrep.repository.BankOrTPPRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/institution-converter")
@PreAuthorize("hasRole('ADMIN')")
class InstitutionConverterController(
    private val institutionIdConverterRepository: InstitutionIdConverterRepository,
    private val bankOrTPPRepository: BankOrTPPRepository
) {

    @GetMapping
    fun getAllConverters(): ResponseEntity<List<InstitutionIdConverterDto>> {
        val converters = institutionIdConverterRepository.findAll().map { converter ->
            InstitutionIdConverterDto(
                id = converter.id,
                sourceInstitutionId = converter.sourceInstitutionId,
                targetBankOrTppCode = converter.targetBankOrTppCode,
                processorCode = converter.processorCode,
                description = converter.description
            )
        }
        return ResponseEntity.ok(converters)
    }

    @GetMapping("/by-processor/{processorCode}")
    fun getConvertersByProcessor(@PathVariable processorCode: String): ResponseEntity<List<InstitutionIdConverterDto>> {
        val converters = institutionIdConverterRepository.findByProcessorCodeAndIsActive(processorCode).map { converter ->
            InstitutionIdConverterDto(
                id = converter.id,
                sourceInstitutionId = converter.sourceInstitutionId,
                targetBankOrTppCode = converter.targetBankOrTppCode,
                processorCode = converter.processorCode,
                description = converter.description
            )
        }
        return ResponseEntity.ok(converters)
    }

    @PostMapping
    fun createConverter(@RequestBody dto: InstitutionIdConverterDto): ResponseEntity<InstitutionIdConverterDto> {
        // Validate that target bank/TPP exists
        val targetBankOrTPP = bankOrTPPRepository.findByCode(dto.targetBankOrTppCode)
            ?: return ResponseEntity.badRequest().build()

        // Validate that processor exists
        val processor = bankOrTPPRepository.findByCode(dto.processorCode)
            ?: return ResponseEntity.badRequest().build()

        val converter = InstitutionIdConverter(
            sourceInstitutionId = dto.sourceInstitutionId,
            targetBankOrTppCode = dto.targetBankOrTppCode,
            processorCode = dto.processorCode,
            description = dto.description,
            isActive = true
        )

        val savedConverter = institutionIdConverterRepository.save(converter)

        val responseDto = InstitutionIdConverterDto(
            id = savedConverter.id,
            sourceInstitutionId = savedConverter.sourceInstitutionId,
            targetBankOrTppCode = savedConverter.targetBankOrTppCode,
            processorCode = savedConverter.processorCode,
            description = savedConverter.description
        )

        return ResponseEntity.ok(responseDto)
    }

    @PutMapping("/{id}")
    fun updateConverter(@PathVariable id: Long, @RequestBody dto: InstitutionIdConverterDto): ResponseEntity<InstitutionIdConverterDto> {
        val existingConverter = institutionIdConverterRepository.findById(id).orElse(null)
            ?: return ResponseEntity.notFound().build()

        // Validate that target bank/TPP exists
        val targetBankOrTPP = bankOrTPPRepository.findByCode(dto.targetBankOrTppCode)
            ?: return ResponseEntity.badRequest().build()

        // Validate that processor exists
        val processor = bankOrTPPRepository.findByCode(dto.processorCode)
            ?: return ResponseEntity.badRequest().build()

        val updatedConverter = existingConverter.copy(
            sourceInstitutionId = dto.sourceInstitutionId,
            targetBankOrTppCode = dto.targetBankOrTppCode,
            processorCode = dto.processorCode,
            description = dto.description
        )

        val savedConverter = institutionIdConverterRepository.save(updatedConverter)

        val responseDto = InstitutionIdConverterDto(
            id = savedConverter.id,
            sourceInstitutionId = savedConverter.sourceInstitutionId,
            targetBankOrTppCode = savedConverter.targetBankOrTppCode,
            processorCode = savedConverter.processorCode,
            description = savedConverter.description
        )

        return ResponseEntity.ok(responseDto)
    }

    @DeleteMapping("/{id}")
    fun deleteConverter(@PathVariable id: Long): ResponseEntity<Void> {
        if (!institutionIdConverterRepository.existsById(id)) {
            return ResponseEntity.notFound().build()
        }

        institutionIdConverterRepository.deleteById(id)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/banks-and-tpps")
    fun getBanksAndTpps(): ResponseEntity<List<Map<String, Any>>> {
        val banksAndTpps = bankOrTPPRepository.findAll().map { bankOrTpp ->
            mapOf(
                "code" to bankOrTpp.code,
                "name" to bankOrTpp.name,
                "type" to bankOrTpp.type.name,
                "useConverter" to bankOrTpp.useConverter
            )
        }
        return ResponseEntity.ok(banksAndTpps)
    }

    @PutMapping("/converter-setting/{code}")
    fun updateConverterSetting(@PathVariable code: String, @RequestBody request: Map<String, Boolean>): ResponseEntity<Map<String, Any>> {
        val useConverter = request["useConverter"] ?: return ResponseEntity.badRequest().build()
        
        val bankOrTpp = bankOrTPPRepository.findByCode(code)
            ?: return ResponseEntity.notFound().build()

        val updated = bankOrTpp.copy(useConverter = useConverter)
        bankOrTPPRepository.save(updated)

        return ResponseEntity.ok(mapOf(
            "code" to updated.code,
            "name" to updated.name,
            "type" to updated.type.name,
            "useConverter" to updated.useConverter
        ))
    }
}
