package com.payrep.service

import org.springframework.stereotype.Service
import java.io.File
import java.io.FileWriter
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class FileProcessingLogger {
    
    private val logDirectory = File("logs/file-processing")
    
    init {
        // Ensure log directory exists
        if (!logDirectory.exists()) {
            logDirectory.mkdirs()
        }
    }
    
    fun createProcessingLog(fileName: String, processorCode: String): ProcessingLogWriter {
        val timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"))
        val logFileName = "${processorCode}_${fileName}_${timestamp}.log"
        val logFile = File(logDirectory, logFileName)
        
        return ProcessingLogWriter(logFile, fileName, processorCode)
    }
}

class ProcessingLogWriter(
    private val logFile: File,
    private val fileName: String,
    private val processorCode: String
) {
    private val writer = FileWriter(logFile, true)
    private var recordsProcessed = 0
    private var recordsAccepted = 0
    private var recordsRejected = 0
    private val rejectionReasons = mutableMapOf<String, Int>()
    
    init {
        writeHeader()
    }
    
    private fun writeHeader() {
        writer.write("=".repeat(80) + "\n")
        writer.write("FILE PROCESSING LOG\n")
        writer.write("=".repeat(80) + "\n")
        writer.write("File: $fileName\n")
        writer.write("Processor: $processorCode\n")
        writer.write("Started: ${LocalDateTime.now()}\n")
        writer.write("=".repeat(80) + "\n\n")
        writer.flush()
    }
    
    fun logRecordProcessing(recordNumber: Int, data: Map<String, Any>, status: ProcessingStatus, reason: String? = null) {
        recordsProcessed++
        
        when (status) {
            ProcessingStatus.ACCEPTED -> {
                recordsAccepted++
                writer.write("✅ RECORD $recordNumber: ACCEPTED\n")
                writer.write("   Data: $data\n")
            }
            ProcessingStatus.REJECTED -> {
                recordsRejected++
                val rejectionReason = reason ?: "Unknown reason"
                rejectionReasons[rejectionReason] = rejectionReasons.getOrDefault(rejectionReason, 0) + 1
                writer.write("❌ RECORD $recordNumber: REJECTED - $rejectionReason\n")
                writer.write("   Data: $data\n")
            }
            ProcessingStatus.WARNING -> {
                writer.write("⚠️ RECORD $recordNumber: WARNING - $reason\n")
                writer.write("   Data: $data\n")
            }
        }
        writer.write("\n")
        writer.flush()
    }
    
    fun logInstitutionMapping(sourceId: String, targetCode: String, mapped: Boolean) {
        if (mapped) {
            writer.write("🔄 INSTITUTION MAPPING: $sourceId → $targetCode (SUCCESS)\n")
        } else {
            writer.write("❌ INSTITUTION MAPPING: $sourceId → NOT FOUND\n")
        }
        writer.flush()
    }
    
    fun logError(error: String, exception: Throwable? = null) {
        writer.write("💥 ERROR: $error\n")
        exception?.let {
            writer.write("   Exception: ${it.message}\n")
            writer.write("   Stack trace: ${it.stackTrace.take(5).joinToString("\n   ")}\n")
        }
        writer.write("\n")
        writer.flush()
    }
    
    fun close() {
        writeSummary()
        writer.close()
    }
    
    private fun writeSummary() {
        writer.write("\n" + "=".repeat(80) + "\n")
        writer.write("PROCESSING SUMMARY\n")
        writer.write("=".repeat(80) + "\n")
        writer.write("Completed: ${LocalDateTime.now()}\n")
        writer.write("Total Records Processed: $recordsProcessed\n")
        writer.write("Records Accepted: $recordsAccepted\n")
        writer.write("Records Rejected: $recordsRejected\n")
        writer.write("Success Rate: ${if (recordsProcessed > 0) String.format("%.2f", (recordsAccepted.toDouble() / recordsProcessed) * 100) else "0.00"}%\n")
        
        if (rejectionReasons.isNotEmpty()) {
            writer.write("\nREJECTION REASONS:\n")
            rejectionReasons.forEach { (reason, count) ->
                writer.write("  - $reason: $count occurrences\n")
            }
        }
        
        writer.write("=".repeat(80) + "\n")
        writer.flush()
    }
}

enum class ProcessingStatus {
    ACCEPTED,
    REJECTED,
    WARNING
}
