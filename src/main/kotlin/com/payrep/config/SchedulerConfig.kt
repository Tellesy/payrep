package com.payrep.config

import com.payrep.services.FileProcessor
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.TaskScheduler
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZonedDateTime

@Configuration
@EnableScheduling
class SchedulerConfig {
    
    @Bean
    fun taskScheduler(): TaskScheduler {
        val scheduler = ThreadPoolTaskScheduler()
        scheduler.poolSize = 5
        scheduler.threadNamePrefix = "FileProcessor-"
        return scheduler
    }
}

// Component to handle scheduled tasks
@Component
class FileIngestionScheduler(
    private val fileProcessor: FileProcessor,
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
        val zoneId = ZoneId.systemDefault()
        val scheduleTime = config.scheduleTime
        val currentTime = LocalDateTime.now()
        
        // Calculate first run time
        val firstRun = currentTime.toLocalDate().atTime(scheduleTime)
        val firstRunZoned = ZonedDateTime.of(firstRun, zoneId)
        
        // If first run time has already passed today, schedule for tomorrow
        val firstRunTime = if (firstRunZoned.isBefore(ZonedDateTime.now())) {
            firstRunZoned.plusDays(1)
        } else {
            firstRunZoned
        }

        logger.info("Scheduling file processing for ${config.bankOrTPP.code} at ${firstRunTime}")
        
        taskScheduler.scheduleWithFixedDelay(
            { fileProcessor.processFiles() },
            firstRunTime.toInstant(),
            24 * 60 * 60 * 1000 // 24 hours in milliseconds
        )
    }
}
