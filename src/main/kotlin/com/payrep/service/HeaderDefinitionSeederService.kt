package com.payrep.service

import com.payrep.domain.HeaderAlias
import com.payrep.domain.HeaderDefinition
import com.payrep.repository.ColumnMappingRepository
import com.payrep.repository.HeaderAliasRepository
import com.payrep.repository.HeaderDefinitionRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Order(5) // After ColumnMappingSeederService (@Order(3)) and InstitutionConverterSeederService (@Order(4))
class HeaderDefinitionSeederService(
    private val columnMappingRepository: ColumnMappingRepository,
    private val headerDefinitionRepository: HeaderDefinitionRepository,
    private val headerAliasRepository: HeaderAliasRepository
) : CommandLineRunner {

    private val logger = LoggerFactory.getLogger(HeaderDefinitionSeederService::class.java)

    @Transactional
    override fun run(vararg args: String?) {
        logger.info("Starting HeaderDefinitionSeederService...")

        var created = 0
        var updated = 0
        var aliasesCreated = 0

        // Canonicalization helpers (placed before pre-cleanup for reuse)
        fun camelToSpaces(s: String): String = s
            // lower/number -> Upper
            .replace(Regex("([a-z0-9])([A-Z])"), "$1 $2")
            // ALLCAPS followed by CamelCase word start, e.g., ECommerce -> E Commerce
            .replace(Regex("([A-Z]+)([A-Z][a-z])"), "$1 $2")
        fun normalizeEntityType(s: String): String = camelToSpaces(s.trim())
            .replace(Regex("[_-]"), " ")
            .replace(Regex("\\s+"), " ")
            .lowercase()
        fun canonicalEntityType(raw: String): String {
            val norm = normalizeEntityType(raw)
            val map = mapOf(
                "atm terminal data" to "ATM Terminal Data",
                "atm transaction data" to "ATM Transaction Data",
                "pos terminal data" to "POS Terminal Data",
                "pos transaction data" to "POS Transaction Data",
                "card lifecycle" to "Card Lifecycle",
                "e commerce card activity" to "E-Commerce Card Activity",
                "ecommerce card activity" to "E-Commerce Card Activity",
                "transaction volume" to "Transaction Volume",
            )
            return map[norm] ?: raw.trim()
        }

        // --- Pre-cleanup: merge duplicates safely by canonical(entityType), then update keeper ---
        run {
            val all = headerDefinitionRepository.findAll()
            if (all.isNotEmpty()) {
                // Group by CANONICAL entityType and key
                val groups = all.groupBy { canonicalEntityType(it.entityType) to it.key }
                groups.forEach { (pair, defs) ->
                    val (canonicalType, key) = pair
                    // Prefer a keeper that is already canonical, else the lowest id
                    val keeper = defs.minWithOrNull(
                        compareBy<HeaderDefinition> { if (it.entityType == canonicalType) 0 else 1 }
                            .thenBy { it.id ?: Long.MAX_VALUE }
                    )!!
                    val dups = defs.filter { it.id != keeper.id }

                    // Move aliases and delete dups FIRST to avoid unique key conflicts
                    dups.forEach { dup ->
                        val dupAliases = headerAliasRepository.findByHeaderDefinition(dup)
                        dupAliases.forEach { alias ->
                            headerAliasRepository.save(alias.copy(id = null, headerDefinition = keeper))
                        }
                        headerDefinitionRepository.deleteById(dup.id!!)
                        logger.warn("[PreCleanup] Merged duplicate HeaderDefinition id=${dup.id} into id=${keeper.id} for canonicalType='${canonicalType}', key='${key}'")
                    }

                    // Finally, if keeper is non-canonical, update it AFTER duplicates are removed
                    if (keeper.entityType != canonicalType) {
                        val updatedKeeper = keeper.copy(entityType = canonicalType)
                        headerDefinitionRepository.save(updatedKeeper)
                        updated++
                        logger.info("[PreCleanup] Canonicalized keeper entityType: '${keeper.entityType}' -> '${canonicalType}' for key='${key}' (id=${keeper.id})")
                    }
                }
            }
        }

        // Preload existing definitions to merge by normalized entityType+key
        val existingByNorm: MutableMap<Pair<String, String>, HeaderDefinition> =
            headerDefinitionRepository.findAll().associateBy(
                { normalizeEntityType(it.entityType) to it.key }, { it }
            ).toMutableMap()

        // 1) Seed from existing ColumnMappings (if any)
        val mappings = columnMappingRepository.findAll()
        if (mappings.isEmpty()) {
            logger.warn("No ColumnMappings found. Skipping ColumnMapping-based header seeding.")
        } else {
            // Group by (entityType, fieldName)
            val grouped = mappings.groupBy { canonicalEntityType(it.entityType) to it.fieldName }
            logger.info("[ColumnMappings] Found ${grouped.size} unique (entityType, key) pairs to seed header definitions")

            grouped.forEach { (entityKey, list) ->
                val (entityType, key) = entityKey
                // Determine preferred display name (most frequent columnName)
                val nameCounts = list.groupingBy { it.columnName }.eachCount()
                val preferred = nameCounts.maxByOrNull { it.value }?.key ?: list.first().columnName
                val alternatives = nameCounts.keys.filter { it != preferred }

                // Try to find existing by normalized pair first (handles prior non-canonical rows)
                var existing = existingByNorm[normalizeEntityType(entityType) to key]
                    ?: headerDefinitionRepository.findByEntityTypeAndKey(entityType, key)
                if (existing == null) {
                    val def = headerDefinitionRepository.save(
                        HeaderDefinition(
                            entityType = entityType,
                            key = key,
                            displayName = preferred
                        )
                    )
                    created++
                    logger.info("[ColumnMappings] Created: entityType='${entityType}', key='${key}', displayName='${preferred}')")
                    // Add aliases
                    alternatives.forEach { aliasName ->
                        headerAliasRepository.save(HeaderAlias(headerDefinition = def, alias = aliasName))
                        aliasesCreated++
                    }
                    existingByNorm[normalizeEntityType(entityType) to key] = def
                 } else {
                    // Work with a guaranteed non-null instance
                    var current: HeaderDefinition = requireNotNull(existing)
                    // If existing has non-canonical entityType, update to canonical
                    val canonical = canonicalEntityType(current.entityType)
                    if (current.entityType != canonical) {
                        val updatedEntityTypeDef = current.copy(entityType = canonical)
                        current = headerDefinitionRepository.save(updatedEntityTypeDef)
                        existingByNorm[normalizeEntityType(canonical) to key] = current
                        logger.info("[ColumnMappings] Canonicalized entityType: '${updatedEntityTypeDef.entityType}' -> '${canonical}' for key='${key}'")
                    }
                    // Update display name if changed
                    if (current.displayName != preferred) {
                        val updatedDef = current.copy(displayName = preferred)
                        current = headerDefinitionRepository.save(updatedDef)
                        updated++
                        logger.info("[ColumnMappings] Updated displayName: entityType='${entityType}', key='${key}' -> '${preferred}'")
                    }
                    // Ensure aliases exist
                    val existingAliases = headerAliasRepository.findByHeaderDefinition(current).map { it.alias }.toSet()
                    alternatives.filter { it !in existingAliases && it != current.displayName }.forEach { aliasName ->
                        headerAliasRepository.save(HeaderAlias(headerDefinition = current, alias = aliasName))
                        aliasesCreated++
                    }
                }
            }
        }

        // 2) Seed hardcoded defaults from the seven report templates (does not rely on files)
        val defaults = defaultHeaderSeeds()
        logger.info("[Defaults] Seeding hardcoded header definitions for ${defaults.values.sumOf { it.size }} keys across ${defaults.keys.size} entity types")

        defaults.forEach { (rawEntityType, seeds) ->
            val entityType = canonicalEntityType(rawEntityType)
            seeds.forEach { seed ->
                // Try merge with any normalized existing row
                val existing = existingByNorm[normalizeEntityType(entityType) to seed.key]
                    ?: headerDefinitionRepository.findByEntityTypeAndKey(entityType, seed.key)
                if (existing == null) {
                    val def = headerDefinitionRepository.save(
                        HeaderDefinition(
                            entityType = entityType,
                            key = seed.key,
                            displayName = seed.displayName
                        )
                    )
                    created++
                    existingByNorm[normalizeEntityType(entityType) to seed.key] = def
                    // add aliases
                    seed.aliases.distinct().filter { it != seed.displayName }.forEach { aliasName ->
                        headerAliasRepository.save(HeaderAlias(headerDefinition = def, alias = aliasName))
                        aliasesCreated++
                    }
                    logger.info("[Defaults] Created: entityType='${entityType}', key='${seed.key}', displayName='${seed.displayName}', aliases=${seed.aliases}")
                } else {
                    // Work with a guaranteed non-null instance
                    var current: HeaderDefinition = requireNotNull(existing)
                    // Ensure entityType is canonical on existing
                    val canonical = canonicalEntityType(current.entityType)
                    if (current.entityType != canonical) {
                        val updatedDef = current.copy(entityType = canonical)
                        current = headerDefinitionRepository.save(updatedDef)
                        updated++
                        existingByNorm[normalizeEntityType(canonical) to seed.key] = current
                        logger.info("[Defaults] Canonicalized existing: '${updatedDef.entityType}' -> '${canonical}' for key='${seed.key}'")
                    }
                    // Update displayName if desired default differs (we keep ColumnMapping preferred as higher priority; so only set if empty/different by policy)
                    if (current.displayName.isBlank()) {
                        val updatedDef = current.copy(displayName = seed.displayName)
                        current = headerDefinitionRepository.save(updatedDef)
                        updated++
                        logger.info("[Defaults] Filled blank displayName for key='${seed.key}' -> '${seed.displayName}'")
                    }
                    val existingAliases = headerAliasRepository.findByHeaderDefinition(current).map { it.alias }.toMutableSet()
                    seed.aliases.distinct().filter { it != current.displayName && it !in existingAliases }.forEach { aliasName ->
                        headerAliasRepository.save(HeaderAlias(headerDefinition = current, alias = aliasName))
                        aliasesCreated++
                    }
                }
            }
        }

        logger.info("HeaderDefinitionSeederService completed. Created=$created, Updated=$updated, AliasesCreated=$aliasesCreated")
    }

    // ----- Defaults -----
    private data class Seed(val key: String, val displayName: String, val aliases: List<String>)

    private fun defaultHeaderSeeds(): Map<String, List<Seed>> {
        // Helper to generate common alias variants
        fun aliasesFor(display: String, key: String): List<String> {
            val snake = key
            val spaced = display
            val spacedLower = spaced.lowercase()
            val snakeFromDisplay = spaced.replace(" ", "_").lowercase()
            return listOf(spaced, spacedLower, snake, snakeFromDisplay).distinct()
        }

        fun seed(key: String, display: String): Seed = Seed(key, display, aliasesFor(display, key))

        return mapOf(
            // 1) ATM Terminal Data
            "ATM Terminal Data" to listOf(
                seed("atmId", "ATM ID"),
                seed("institutionId", "Institution ID"),
                seed("location", "Location"),
                seed("status", "Status"),
                seed("lastMaintenanceDate", "Last Maintenance Date"),
                seed("uptimePercentage", "Uptime Percentage"),
                seed("reportDate", "Report Date")
            ),
            // 2) ATM Transaction Data
            "ATM Transaction Data" to listOf(
                seed("transactionId", "Transaction ID"),
                seed("atmId", "ATM ID"),
                seed("institutionId", "Institution ID"),
                seed("transactionType", "Transaction Type"),
                seed("amount", "Amount"),
                seed("status", "Status"),
                seed("transactionDate", "Transaction Date"),
                seed("reportDate", "Report Date")
            ),
            // 3) POS Terminal Data
            "POS Terminal Data" to listOf(
                seed("terminalId", "Terminal ID"),
                seed("institutionId", "Institution ID"),
                seed("merchantId", "Merchant ID"),
                seed("location", "Location"),
                seed("status", "Status"),
                seed("lastTransactionDate", "Last Transaction Date"),
                seed("terminalsDeliveredCount", "Terminals Delivered Count"),
                seed("terminalsActiveCount", "Terminals Active Count"),
                seed("uptimePercentage", "Uptime Percentage"),
                seed("reportDate", "Report Date")
            ),
            // 4) POS Transaction Data
            "POS Transaction Data" to listOf(
                seed("transactionId", "Transaction ID"),
                seed("terminalId", "Terminal ID"),
                seed("institutionId", "Institution ID"),
                seed("amount", "Amount"),
                seed("status", "Status"),
                seed("transactionDate", "Transaction Date"),
                seed("reportDate", "Report Date")
            ),
            // 5) Card Lifecycle
            "Card Lifecycle" to listOf(
                seed("cardId", "Card ID"),
                seed("institutionId", "Institution ID"),
                seed("cardType", "Card Type"),
                seed("status", "Status"),
                seed("issueDate", "Issue Date"),
                seed("expiryDate", "Expiry Date"),
                seed("activationDate", "Activation Date"),
                seed("reportDate", "Report Date")
            ),
            // 6) E-Commerce Card Activity
            "E-Commerce Card Activity" to listOf(
                seed("cardId", "Card ID"),
                seed("institutionId", "Institution ID"),
                seed("transactionCount", "Transaction Count"),
                seed("totalVolume", "Total Volume"),
                seed("status", "Status"),
                seed("lastActivityDate", "Last Activity Date"),
                seed("reportDate", "Report Date")
            ),
            // 7) Transaction Volume
            "Transaction Volume" to listOf(
                seed("institutionId", "Institution ID"),
                seed("transactionType", "Transaction Type"),
                seed("transactionCount", "Transaction Count"),
                seed("totalAmount", "Total Amount"),
                seed("averageAmount", "Average Amount"),
                seed("reportDate", "Report Date")
            )
        )
    }
}
