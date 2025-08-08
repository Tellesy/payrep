package com.payrep.controller

import com.payrep.domain.HeaderAlias
import com.payrep.domain.HeaderDefinition
import com.payrep.dto.HeaderDefinitionDto
import com.payrep.dto.HeaderAliasDto
import com.payrep.repository.HeaderAliasRepository
import com.payrep.repository.HeaderDefinitionRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/headers")
class HeaderAdminController(
    private val headerDefinitionRepository: HeaderDefinitionRepository,
    private val headerAliasRepository: HeaderAliasRepository
) {
    // ---- Canonicalization helpers ----
    private fun camelToSpaces(s: String): String = s.replace(Regex("([a-z])([A-Z])"), "$1 $2")
    private fun normalizeEntityType(s: String): String = camelToSpaces(s.trim())
        .replace(Regex("[_-]"), " ")
        .replace(Regex("\\s+"), " ")
        .lowercase()
    private fun canonicalEntityType(raw: String): String {
        val norm = normalizeEntityType(raw)
        val map = mapOf(
            "atm terminal data" to "ATM Terminal Data",
            "atm transaction data" to "ATM Transaction Data",
            "pos terminal data" to "POS Terminal Data",
            "pos transaction data" to "POS Transaction Data",
            "card lifecycle" to "Card Lifecycle",
            "e commerce card activity" to "E-Commerce Card Activity",
            "e-commerce card activity" to "E-Commerce Card Activity",
            "transaction volume" to "Transaction Volume",
        )
        return map[norm] ?: raw.trim()
    }
    private val allowedCanonicalTypes = setOf(
        "ATM Terminal Data",
        "ATM Transaction Data",
        "POS Terminal Data",
        "POS Transaction Data",
        "Card Lifecycle",
        "E-Commerce Card Activity",
        "Transaction Volume"
    )
    // List header definitions (optionally filter by entityType)
    @GetMapping
    fun list(@RequestParam(required = false) entityType: String?): List<HeaderDefinitionDto> {
        val defs = if (entityType.isNullOrBlank()) {
            headerDefinitionRepository.findAll()
        } else {
            val canonical = canonicalEntityType(entityType)
            headerDefinitionRepository.findByEntityType(canonical)
        }
        // Canonicalize for display and de-duplicate by (entityType,key)
        val canonicalized = defs.map { def ->
            if (def.entityType == canonicalEntityType(def.entityType)) def else def.copy(entityType = canonicalEntityType(def.entityType))
        }
        val deduped = canonicalized
            .groupBy { it.entityType to it.key }
            .values
            .map { group ->
                // prefer an item whose entityType already equals canonical, else lowest id
                group.firstOrNull { it.entityType == canonicalEntityType(it.entityType) } ?: group.minBy { it.id ?: Long.MAX_VALUE }
            }
        return deduped
            .sortedWith(compareBy({ it.entityType }, { it.key }))
            .map { HeaderDefinitionDto.fromEntity(it) }
    }

    // Get by id
    @GetMapping("/{id}")
    fun get(@PathVariable id: Long): ResponseEntity<HeaderDefinitionDto> {
        val def = headerDefinitionRepository.findById(id)
        return if (def.isPresent) ResponseEntity.ok(HeaderDefinitionDto.fromEntity(def.get()))
        else ResponseEntity.notFound().build()
    }

    data class CreateHeaderDefinitionRequest(
        val entityType: String,
        val key: String,
        val displayName: String,
        val aliases: List<String>? = null
    )

    @PostMapping
    fun create(@RequestBody req: CreateHeaderDefinitionRequest): ResponseEntity<HeaderDefinitionDto> {
        // Canonicalize and validate entityType
        val canonical = canonicalEntityType(req.entityType)
        if (canonical !in allowedCanonicalTypes) {
            return ResponseEntity.badRequest().build()
        }
        // ensure uniqueness by canonical entityType + key
        val existing = headerDefinitionRepository.findByEntityTypeAndKey(canonical, req.key)
        if (existing != null) {
            return ResponseEntity.ok(HeaderDefinitionDto.fromEntity(existing))
        }
        val saved = headerDefinitionRepository.save(
            HeaderDefinition(
                entityType = canonical,
                key = req.key,
                displayName = req.displayName
            )
        )
        // add aliases if provided
        req.aliases?.forEach { aliasStr ->
            headerAliasRepository.save(HeaderAlias(headerDefinition = saved, alias = aliasStr))
        }
        val reloaded = headerDefinitionRepository.findById(saved.id!!).get()
        return ResponseEntity.ok(HeaderDefinitionDto.fromEntity(reloaded))
    }

    data class UpdateHeaderDefinitionRequest(
        val displayName: String
    )

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody req: UpdateHeaderDefinitionRequest): ResponseEntity<HeaderDefinitionDto> {
        val defOpt = headerDefinitionRepository.findById(id)
        if (defOpt.isEmpty) return ResponseEntity.notFound().build()
        val def = defOpt.get()
        val updated = def.copy(displayName = req.displayName)
        val saved = headerDefinitionRepository.save(updated)
        return ResponseEntity.ok(HeaderDefinitionDto.fromEntity(saved))
    }

    // Aliases operations
    @GetMapping("/{id}/aliases")
    fun listAliases(@PathVariable id: Long): ResponseEntity<List<HeaderAliasDto>> {
        val defOpt = headerDefinitionRepository.findById(id)
        if (defOpt.isEmpty) return ResponseEntity.notFound().build()
        val aliases = headerAliasRepository.findByHeaderDefinition(defOpt.get()).map { HeaderAliasDto.fromEntity(it) }
        return ResponseEntity.ok(aliases)
    }

    data class CreateAliasRequest(val alias: String)

    @PostMapping("/{id}/aliases")
    fun addAlias(@PathVariable id: Long, @RequestBody req: CreateAliasRequest): ResponseEntity<HeaderAliasDto> {
        val defOpt = headerDefinitionRepository.findById(id)
        if (defOpt.isEmpty) return ResponseEntity.notFound().build()
        val saved = headerAliasRepository.save(HeaderAlias(headerDefinition = defOpt.get(), alias = req.alias))
        return ResponseEntity.ok(HeaderAliasDto.fromEntity(saved))
    }

    @DeleteMapping("/{id}/aliases/{aliasId}")
    fun deleteAlias(@PathVariable id: Long, @PathVariable aliasId: Long): ResponseEntity<Void> {
        val defOpt = headerDefinitionRepository.findById(id)
        if (defOpt.isEmpty) return ResponseEntity.notFound().build()
        if (!headerAliasRepository.existsById(aliasId)) return ResponseEntity.notFound().build()
        headerAliasRepository.deleteById(aliasId)
        return ResponseEntity.noContent().build()
    }
}
