package com.payrep.config

import com.payrep.domain.FileProcessingConfig
import com.payrep.repository.FileProcessingConfigRepository
import com.payrep.service.FileIngestionService
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.TaskScheduler
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import org.springframework.stereotype.Component
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime
import jakarta.annotation.PostConstruct

@Configuration
@EnableScheduling
open class SchedulerConfig {
    
    @Bean
    open fun taskScheduler(): TaskScheduler {
        val scheduler = ThreadPoolTaskScheduler()
        scheduler.poolSize = 5
        scheduler.threadNamePrefix = "FileProcessor-"
        return scheduler
    }
}

// Component to handle scheduled tasks
@Component
class FileIngestionScheduler(
    private val fileIngestionService: FileIngestionService,
    private val fileProcessingConfigRepository: FileProcessingConfigRepository,
    private val taskScheduler: TaskScheduler
) {
    private val logger = LoggerFactory.getLogger(FileIngestionScheduler::class.java)

    @PostConstruct
    fun scheduleTasks() {
        val configs = fileProcessingConfigRepository.findAll()
        configs.forEach { config ->
            scheduleFileProcessing(config)
        }
    }

    private fun scheduleFileProcessing(config: FileProcessingConfig) {
        logger.info("Scheduling file processing for ${config.bankOrTPP.code}")
        
        // For now, we'll use a simple approach - the FileIngestionService already has @Scheduled annotation
        // This method can be enhanced later to support dynamic scheduling based on config.scheduleTime
        // Currently, the scheduling is handled by the @Scheduled annotation in FileIngestionService
    }
}
