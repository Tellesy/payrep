package com.payrep.service

import com.payrep.domain.*
import com.payrep.repository.*
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import kotlin.random.Random

@Service
class DataSeederService(
    private val bankOrTPPRepository: BankOrTPPRepository,
    private val fileProcessingConfigRepository: FileProcessingConfigRepository,
    private val transactionVolumeRepository: TransactionVolumeRepository,
    private val atmTransactionRepository: AtmTransactionDataRepository,
    private val atmTerminalRepository: AtmTerminalDataRepository,
    private val posTerminalRepository: PosTerminalDataRepository,
    private val posTransactionRepository: PosTransactionDataRepository,
    private val cardLifecycleRepository: CardLifecycleRepository,
    private val eCommerceCardActivityRepository: ECommerceCardActivityRepository
) : CommandLineRunner {

    private val logger = LoggerFactory.getLogger(DataSeederService::class.java)

    @Transactional
    override fun run(vararg args: String?) {
        logger.info("Starting database seeding...")
        
        seedBanksAndTPPs()
        seedFileProcessingConfigs()
        seedJuneReportData()
        
        logger.info("Database seeding completed successfully!")
    }

    private fun seedBanksAndTPPs() {
        if (bankOrTPPRepository.count() > 0) {
            logger.info("Banks and TPPs already exist, skipping seeding")
            return
        }

        logger.info("Seeding banks and TPPs...")
        
        val banks = listOf(
            BankOrTPP(code = "002", name = "Jumhouria Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "004", name = "National Commercial Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "005", name = "Bank of Commerce & Development", type = BankOrTPPType.BANK),
            BankOrTPP(code = "024", name = "Nuran Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "006", name = "Sahara Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "025", name = "Wahda Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "007", name = "North Africa Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "012", name = "Waha Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "013", name = "Aman Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "016", name = "Al Wafa Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "020", name = "Assaray Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "021", name = "First Commercial Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "017", name = "UBCI Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "015", name = "Al Ejtemad Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "018", name = "MediterBank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "014", name = "Al Aman Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "023", name = "Development Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "026", name = "Najeem Bank", type = BankOrTPPType.BANK),
            BankOrTPP(code = "027", name = "Andalus Bank", type = BankOrTPPType.BANK),
            // TPPs
            BankOrTPP(code = "999", name = "Moamalat", type = BankOrTPPType.TPP),
            BankOrTPP(code = "901", name = "Tadawul", type = BankOrTPPType.TPP),
            BankOrTPP(code = "902", name = "Obour", type = BankOrTPPType.TPP)
        )

        bankOrTPPRepository.saveAll(banks)
        logger.info("Seeded ${banks.size} banks and TPPs")
    }

    private fun seedFileProcessingConfigs() {
        if (fileProcessingConfigRepository.count() > 0) {
            logger.info("File processing configs already exist, skipping seeding")
            return
        }

        logger.info("Seeding file processing configurations...")
        
        val allBanksAndTPPs = bankOrTPPRepository.findAll()
        val configs = mutableListOf<FileProcessingConfig>()
        
        val reportTypes = listOf(
            Triple("TransactionVolume", "TransactionVolume_*_*.csv", "/data/reports/transaction-volume"),
            Triple("ATMTransactionData", "ATMTransactionData_*_*.csv", "/data/reports/atm-transactions"),
            Triple("POSTerminalData", "POSTerminalData_*_*.csv", "/data/reports/pos-terminals")
        )
        
        for (bankOrTPP in allBanksAndTPPs) {
            for ((_, pattern, directory) in reportTypes) {
                configs.add(FileProcessingConfig(
                    bankOrTPP = bankOrTPP,
                    directoryPath = "${directory}/${bankOrTPP.code}",
                    fileNamePattern = pattern.replace("*", bankOrTPP.code),
                    scheduleTime = "0 0 2 * * ?", // Daily at 2 AM
                    fileType = "CSV"
                ))
            }
        }
        
        fileProcessingConfigRepository.saveAll(configs)
        logger.info("Seeded ${configs.size} file processing configurations")
    }

    private fun seedJuneReportData() {
        logger.info("Seeding fake report data for June 2025...")
        
        seedTransactionVolumeData()
        seedATMTransactionData()
        seedATMTerminalData()
        seedPOSTerminalData()
        seedPOSTransactionData()
        seedCardLifecycleData()
        seedECommerceCardActivityData()
    }

    private fun seedTransactionVolumeData() {
        if (transactionVolumeRepository.count() > 0) {
            logger.info("Transaction volume data already exists, skipping seeding")
            return
        }

        logger.info("Seeding transaction volume data for June 2025...")
        
        val channels = listOf("ATM", "POS", "MOBILE", "INTERNET", "BRANCH")
        val transactionTypes = listOf(
            Pair("WITHDRAWAL", "Cash Withdrawal"),
            Pair("DEPOSIT", "Cash Deposit"),
            Pair("TRANSFER", "Fund Transfer"),
            Pair("PAYMENT", "Bill Payment"),
            Pair("INQUIRY", "Balance Inquiry")
        )
        val mccCodes = listOf(
            Pair("5411", "Grocery Stores"),
            Pair("5812", "Eating Places"),
            Pair("5541", "Service Stations"),
            Pair("4111", "Transportation"),
            Pair("5311", "Department Stores")
        )
        val categories = listOf("RETAIL", "COMMERCIAL", "GOVERNMENT", "PERSONAL")
        
        val allBanksAndTPPs = bankOrTPPRepository.findAll()
        val startDate = LocalDate.of(2025, 6, 1)
        val endDate = LocalDate.of(2025, 6, 30)
        
        val transactions = mutableListOf<TransactionVolume>()
        
        for (date in generateDateRange(startDate, endDate)) {
            for (bankOrTPP in allBanksAndTPPs) {
                for (channel in channels) {
                    for ((txnTypeCode, txnTypeDesc) in transactionTypes) {
                        for ((mccCode, mccDesc) in mccCodes) {
                            for (category in categories) {
                                val txnCount = Random.nextInt(50, 2000)
                                val successCount = (txnCount * Random.nextDouble(0.85, 0.98)).toInt()
                                val failedCount = txnCount - successCount
                                val totalAmount = BigDecimal(Random.nextDouble(5000.0, 250000.0))
                                
                                transactions.add(TransactionVolume(
                                    institution_id = bankOrTPP.code,
                                    institution_name = bankOrTPP.name,
                                    channel_code = channel,
                                    transaction_type_code = txnTypeCode,
                                    transaction_type_desc = txnTypeDesc,
                                    mcc_code = mccCode,
                                    mcc_description = mccDesc,
                                    txn_count = txnCount,
                                    txn_total_amount = totalAmount,
                                    txn_success_count = successCount,
                                    txn_failed_count = failedCount,
                                    transaction_category = category,
                                    report_date = date,
                                    fileName = "TransactionVolume_${bankOrTPP.code}_${date}.csv"
                                ))
                            }
                        }
                    }
                }
            }
        }
        
        // Save in batches to avoid memory issues
        val batchSize = 1000
        transactions.chunked(batchSize).forEach { batch ->
            transactionVolumeRepository.saveAll(batch)
        }
        logger.info("Seeded ${transactions.size} transaction volume records")
    }

    private fun seedATMTransactionData() {
        if (atmTransactionRepository.count() > 0) {
            logger.info("ATM transaction data already exists, skipping seeding")
            return
        }

        logger.info("Seeding ATM transaction data for June 2025...")
        
        val allBanks = bankOrTPPRepository.findAll().filter { it.type == BankOrTPPType.BANK }
        val startDate = LocalDate.of(2025, 6, 1)
        val endDate = LocalDate.of(2025, 6, 30)
        val branches = listOf("MAIN", "DOWNTOWN", "AIRPORT", "MALL", "UNIVERSITY")
        val categories = listOf("WITHDRAWAL", "DEPOSIT", "INQUIRY", "TRANSFER")
        
        val transactions = mutableListOf<AtmTransactionData>()
        
        // Create unique combinations respecting the constraint [atm_id, institution_id, report_date]
        for (date in generateDateRange(startDate, endDate)) {
            for (bank in allBanks) {
                for (atmId in 1..15) {
                    // Pick one random branch and aggregate all categories for this ATM/date combination
                    val selectedBranch = branches.random()
                    val selectedCategory = categories.random()
                    
                    val atmIdStr = "${bank.code}_ATM_${String.format("%03d", atmId)}"
                    val successCount = Random.nextInt(50, 800) // Higher range since we're aggregating
                    val failedCount = Random.nextInt(5, 80)
                    val totalLoadedAmount = BigDecimal(Random.nextDouble(50000.0, 2000000.0)) // Higher range
                    
                    transactions.add(AtmTransactionData(
                        institution_id = bank.code,
                        institution_name = bank.name,
                        atm_id = atmIdStr,
                        branch_name = "${bank.name} - $selectedBranch",
                        txn_success_count = successCount,
                        txn_failed_count = failedCount,
                        total_loaded_amount = totalLoadedAmount,
                        transaction_category = selectedCategory,
                        report_date = date
                    ))
                }
            }
        }
        
        // Save in batches
        val batchSize = 1000
        transactions.chunked(batchSize).forEach { batch ->
            atmTransactionRepository.saveAll(batch)
        }
        logger.info("Seeded ${transactions.size} ATM transaction records")
    }

    private fun seedPOSTerminalData() {
        if (posTerminalRepository.count() > 0) {
            logger.info("POS terminal data already exists, skipping seeding")
            return
        }

        logger.info("Seeding POS terminal data for June 2025...")
        
        val allBanks = bankOrTPPRepository.findAll().filter { it.type == BankOrTPPType.BANK }
        val startDate = LocalDate.of(2025, 6, 1)
        val endDate = LocalDate.of(2025, 6, 30)
        val mccCodes = listOf(
            Pair("5411", "Grocery Stores"),
            Pair("5812", "Eating Places"),
            Pair("5541", "Service Stations"),
            Pair("4111", "Transportation"),
            Pair("5311", "Department Stores"),
            Pair("5912", "Drug Stores"),
            Pair("5814", "Fast Food Restaurants")
        )
        
        val terminals = mutableListOf<PosTerminalData>()
        
        // Respect unique constraint [institution_id, mcc_code, report_date]
        for (date in generateDateRange(startDate, endDate)) {
            for (bank in allBanks) {
                for ((mccCode, mccDesc) in mccCodes) {
                    val issuedCount = Random.nextInt(20, 200)
                    val deliveredCount = (issuedCount * Random.nextDouble(0.8, 0.95)).toInt()
                    val reissuedCount = Random.nextInt(0, 10)
                    val decomCount = Random.nextInt(0, 15)
                    val activeCount = maxOf(0, deliveredCount - decomCount + reissuedCount)
                    val activityCount = (activeCount * Random.nextDouble(0.6, 0.9)).toInt()
                    val totalCount = issuedCount + reissuedCount
                    
                    terminals.add(PosTerminalData(
                        institution_id = bank.code,
                        institution_name = bank.name,
                        mcc_code = mccCode,
                        mcc_description = mccDesc,
                        terminals_issued_count = issuedCount,
                        terminals_delivered_count = deliveredCount,
                        terminals_reissued_count = reissuedCount,
                        terminals_decom_count = decomCount,
                        terminals_active_count = activeCount,
                        terminals_activity_count = activityCount,
                        terminals_total_count = totalCount,
                        report_date = date
                    ))
                }
            }
        }
        
        // Save in batches
        val batchSize = 1000
        terminals.chunked(batchSize).forEach { batch ->
            posTerminalRepository.saveAll(batch)
        }
        logger.info("Seeded ${terminals.size} POS terminal records")
    }

    private fun seedATMTerminalData() {
        if (atmTerminalRepository.count() > 0) {
            logger.info("ATM terminal data already exists, skipping seeding")
            return
        }

        logger.info("Seeding ATM terminal data for June 2025...")
        
        val allBanks = bankOrTPPRepository.findAll().filter { it.type == BankOrTPPType.BANK }
        val startDate = LocalDate.of(2025, 6, 1)
        val endDate = LocalDate.of(2025, 6, 30)
        val locationTypes = listOf("BRANCH", "MALL", "AIRPORT", "STREET", "UNIVERSITY")
        
        val terminals = mutableListOf<AtmTerminalData>()
        
        // Respect unique constraint [institution_id, report_date]
        for (date in generateDateRange(startDate, endDate)) {
            for (bank in allBanks) {
                val newCount = Random.nextInt(1, 5)
                val activeCount = Random.nextInt(50, 200)
                val inactiveCount = Random.nextInt(2, 15)
                val maintenanceCount = Random.nextInt(0, 8)
                val totalCount = activeCount + inactiveCount + maintenanceCount + newCount
                val locationType = locationTypes.random()
                
                terminals.add(AtmTerminalData(
                    institution_id = bank.code,
                    institution_name = bank.name,
                    atm_new_count = newCount,
                    atm_active_count = activeCount,
                    atm_inactive_count = inactiveCount,
                    atm_maintenance_count = maintenanceCount,
                    atm_location_type = locationType,
                    atm_total_count = totalCount,
                    report_date = date
                ))
            }
        }
        
        // Save in batches
        val batchSize = 1000
        terminals.chunked(batchSize).forEach { batch ->
            atmTerminalRepository.saveAll(batch)
        }
        logger.info("Seeded ${terminals.size} ATM terminal records")
    }

    private fun seedPOSTransactionData() {
        if (posTransactionRepository.count() > 0) {
            logger.info("POS transaction data already exists, skipping seeding")
            return
        }

        logger.info("Seeding POS transaction data for June 2025...")
        
        val allBanks = bankOrTPPRepository.findAll().filter { it.type == BankOrTPPType.BANK }
        val startDate = LocalDate.of(2025, 6, 1)
        val endDate = LocalDate.of(2025, 6, 30)
        val categories = listOf("PURCHASE", "REFUND", "CASH_ADVANCE", "BALANCE_INQUIRY")
        
        val transactions = mutableListOf<PosTransactionData>()
        
        // Respect unique constraint [bank_name, transaction_category, report_date]
        for (date in generateDateRange(startDate, endDate)) {
            for (bank in allBanks) {
                for (category in categories) {
                    val successCount = Random.nextInt(100, 5000)
                    val failedCount = Random.nextInt(5, 200)
                    val totalAmount = BigDecimal(Random.nextDouble(50000.0, 5000000.0))
                    
                    transactions.add(PosTransactionData(
                        bank_name = bank.name,
                        txn_success_count = successCount,
                        txn_failed_count = failedCount,
                        total_transaction_amount = totalAmount,
                        transaction_category = category,
                        report_date = date
                    ))
                }
            }
        }
        
        // Save in batches
        val batchSize = 1000
        transactions.chunked(batchSize).forEach { batch ->
            posTransactionRepository.saveAll(batch)
        }
        logger.info("Seeded ${transactions.size} POS transaction records")
    }

    private fun seedCardLifecycleData() {
        if (cardLifecycleRepository.count() > 0) {
            logger.info("Card lifecycle data already exists, skipping seeding")
            return
        }

        logger.info("Seeding card lifecycle data for June 2025...")
        
        val allBanks = bankOrTPPRepository.findAll().filter { it.type == BankOrTPPType.BANK }
        val startDate = LocalDate.of(2025, 6, 1)
        val endDate = LocalDate.of(2025, 6, 30)
        val productCodes = listOf("VISA_CLASSIC", "VISA_GOLD", "MASTERCARD_STANDARD", "MASTERCARD_PLATINUM")
        val productTypes = listOf("DEBIT", "CREDIT", "PREPAID")
        val technologyTypes = listOf("CHIP", "CONTACTLESS", "MAGNETIC_STRIPE")
        
        val cards = mutableListOf<CardLifecycle>()
        
        // Respect unique constraint [institution_id, report_date]
        for (date in generateDateRange(startDate, endDate)) {
            for (bank in allBanks) {
                val productCode = productCodes.random()
                val productType = productTypes.random()
                val technologyType = technologyTypes.random()
                
                val issuedCount = Random.nextInt(100, 2000)
                val deliveredCount = (issuedCount * Random.nextDouble(0.85, 0.95)).toInt()
                val activatedCount = (deliveredCount * Random.nextDouble(0.70, 0.90)).toInt()
                val renewedCount = Random.nextInt(10, 100)
                val reissuedCount = Random.nextInt(5, 50)
                val deactivatedCount = Random.nextInt(2, 30)
                val activityCount = (activatedCount * Random.nextDouble(0.60, 0.85)).toInt()
                
                cards.add(CardLifecycle(
                    institution_id = bank.code,
                    institution_name = bank.name,
                    card_product_code = productCode,
                    card_product_type = productType,
                    card_technology_type = technologyType,
                    cards_issued_count = issuedCount,
                    cards_delivered_count = deliveredCount,
                    cards_activated_count = activatedCount,
                    cards_renewed_count = renewedCount,
                    cards_reissued_count = reissuedCount,
                    cards_deactivated_count = deactivatedCount,
                    cards_activity_count = activityCount,
                    report_date = date
                ))
            }
        }
        
        // Save in batches
        val batchSize = 1000
        cards.chunked(batchSize).forEach { batch ->
            cardLifecycleRepository.saveAll(batch)
        }
        logger.info("Seeded ${cards.size} card lifecycle records")
    }

    private fun seedECommerceCardActivityData() {
        if (eCommerceCardActivityRepository.count() > 0) {
            logger.info("E-commerce card activity data already exists, skipping seeding")
            return
        }

        logger.info("Seeding e-commerce card activity data for June 2025...")
        
        val allBanks = bankOrTPPRepository.findAll().filter { it.type == BankOrTPPType.BANK }
        val startDate = LocalDate.of(2025, 6, 1)
        val endDate = LocalDate.of(2025, 6, 30)
        val productCodes = listOf("VISA_CLASSIC", "VISA_GOLD", "MASTERCARD_STANDARD", "MASTERCARD_PLATINUM")
        
        val activities = mutableListOf<ECommerceCardActivity>()
        
        // Respect unique constraint [institution_id, report_date]
        for (date in generateDateRange(startDate, endDate)) {
            for (bank in allBanks) {
                val productCode = productCodes.random()
                val enabledCards = Random.nextInt(500, 10000)
                val activityCards = (enabledCards * Random.nextDouble(0.30, 0.70)).toInt()
                
                activities.add(ECommerceCardActivity(
                    institution_id = bank.code,
                    institution_name = bank.name,
                    card_product_code = productCode,
                    ecommerce_enabled_cards = enabledCards,
                    ecommerce_activity_cards = activityCards,
                    report_date = date
                ))
            }
        }
        
        // Save in batches
        val batchSize = 1000
        activities.chunked(batchSize).forEach { batch ->
            eCommerceCardActivityRepository.saveAll(batch)
        }
        logger.info("Seeded ${activities.size} e-commerce card activity records")
    }

    private fun generateDateRange(startDate: LocalDate, endDate: LocalDate): List<LocalDate> {
        val dates = mutableListOf<LocalDate>()
        var currentDate = startDate
        while (!currentDate.isAfter(endDate)) {
            dates.add(currentDate)
            currentDate = currentDate.plusDays(1)
        }
        return dates
    }
}
