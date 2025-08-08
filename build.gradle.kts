plugins {
    kotlin("jvm") version "1.9.22"
    kotlin("plugin.spring") version "1.9.22"
    kotlin("plugin.jpa") version "1.9.22"
    id("org.springframework.boot") version "3.2.2"
    id("io.spring.dependency-management") version "1.1.4"
}

group = "com.payrep"
version = "0.0.1-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security") // For authentication
    implementation("org.springframework.boot:spring-boot-starter-tomcat") // For servlet APIs
    
    // JPA API (explicit dependency for Jakarta Persistence)
    implementation("jakarta.persistence:jakarta.persistence-api:3.1.0")

    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")

    // Database
    runtimeOnly("mysql:mysql-connector-java:8.0.33")
    runtimeOnly("com.oracle.database.jdbc:ojdbc8:21.9.0.0")

    // Flyway for database migrations
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-mysql")

    // CSV parsing
    implementation("com.opencsv:opencsv:5.9")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")

    // Testing
        testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
        testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    // Triggering a refresh of gradle dependencies
}

tasks.withType<Test> {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(17)
}

// Task to copy the React build files to the Spring Boot resources
tasks.register<Copy>("copyReactApp") {
    from("admin-ui/build")
    into("src/main/resources/static")
}

// Make the processResources task depend on our new copy task
tasks.named("processResources") {
    dependsOn("copyReactApp")
}
