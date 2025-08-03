# Electronic Payment Data Aggregation System

A Spring Boot application for ingesting, processing, and storing daily reports/files from Libyan commercial banks and Third-Party Payment Providers (TPPs) as part of the Central Bank data aggregation project.

## Features

- **Configuration-driven file ingestion**: Define file processing rules per bank/TPP in the database
- **Scheduled processing**: Automatic file processing based on configurable schedules
- **Dynamic column mapping**: Map CSV columns to database fields through configuration
- **Multi-bank TPP support**: Handle TPP files containing data for multiple banks
- **Error handling and logging**: Comprehensive logging and error tracking
- **Admin API**: REST endpoints for managing configurations
- **Extensible architecture**: Easy to add new file types and data entities

## Tech Stack

- **Spring Boot 3.2.2** (Kotlin)
- **Gradle** (build tool)
- **JPA/Hibernate** (database access)
- **PostgreSQL** (database)
- **Spring Scheduler** (file processing scheduling)
- **OpenCSV** (CSV parsing)

## Database Schema

### Core Configuration Tables
- `bank_or_tpp`: Banks and TPP providers with unique 3-digit codes
- `file_processing_config`: File processing configuration per bank/TPP
- `column_mapping`: Column-to-field mappings for dynamic parsing
- `import_log`: Processing status and error tracking

### Data Tables
- `card_issuance`: Card issuance data
- `transaction_volume`: Transaction volume by channel
- Additional entities can be added as needed

## Getting Started

### Prerequisites
- Java 17+
- PostgreSQL database
- Gradle

### Database Setup
1. Create a PostgreSQL database named `payment_data`
2. Update database credentials in `application.properties` if needed

### Running the Application
```bash
./gradlew bootRun
```

The application will:
1. Create database tables automatically
2. Seed example data for banks, TPPs, and configurations
3. Start the scheduled file processing service

## Configuration

### Adding a New Bank/TPP
Use the Admin API to add new banks or TPPs:

```bash
POST /api/admin/banks
{
  "code": "B03",
  "name": "New Bank",
  "type": "BANK"
}
```

### Configuring File Processing
Add file processing configuration:

```bash
POST /api/admin/file-configs
{
  "bankOrTPPId": 1,
  "directoryPath": "/data/bank_reports/b03",
  "fileNamePattern": "B03_.*\\.csv",
  "scheduleTime": "0 15 0 * * ?",
  "fileType": "CSV"
}
```

### Setting Up Column Mappings
Define how CSV columns map to database fields:

```bash
POST /api/admin/file-configs/1/column-mappings
{
  "columnName": "card_number",
  "entityType": "CardIssuance",
  "fieldName": "cardNumber",
  "transformation": "trim"
}
```

## File Processing

### Supported File Types
- **CSV**: Primary format with configurable column mappings
- **Excel/TSV**: Can be extended

### File Naming Convention
Files should follow the pattern defined in `file_processing_config.fileNamePattern`:
- Bank files: `{BANK_CODE}_*.*` (e.g., `B01_card_issuance_20250803.csv`)
- TPP files: `{TPP_CODE}_*.*` (e.g., `T01_multi_bank_data_20250803.csv`)

### Processing Flow
1. Scheduler checks for new files every 15 minutes
2. Files matching the pattern are processed
3. Data is parsed according to column mappings
4. Successfully processed files are moved to archive directory
5. Processing status is logged in `import_log` table

## API Endpoints

### Bank/TPP Management
- `GET /api/admin/banks` - List all banks/TPPs
- `POST /api/admin/banks` - Create new bank/TPP
- `PUT /api/admin/banks/{id}` - Update bank/TPP
- `DELETE /api/admin/banks/{id}` - Delete bank/TPP

### File Configuration Management
- `GET /api/admin/file-configs` - List all file configurations
- `POST /api/admin/file-configs` - Create file configuration
- `PUT /api/admin/file-configs/{id}` - Update file configuration
- `DELETE /api/admin/file-configs/{id}` - Delete file configuration

### Column Mapping Management
- `GET /api/admin/file-configs/{configId}/column-mappings` - Get column mappings
- `POST /api/admin/file-configs/{configId}/column-mappings` - Create column mapping

### Monitoring
- `GET /api/admin/import-logs` - View import logs
- `GET /api/admin/import-logs/config/{configId}` - View logs for specific config

## Extending the System

### Adding New Data Entities
1. Create new JPA entity in `com.payrep.domain`
2. Add corresponding repository
3. Update column mappings to reference the new entity type
4. Optionally add specific parsing logic in `FileParser`

### Adding New File Types
1. Extend `FileParser.parseFile()` method
2. Add new file type to `FileProcessingConfig.fileType` enum
3. Implement specific parsing logic

### Custom Transformations
Add new transformation types in `FileParser.applyTransformation()`:
- Date formatting
- Number parsing
- String manipulations
- Custom business logic

## Sample Data

The application includes sample data:
- 2 banks (B01: Libyan Commercial Bank, B02: Al-Baraka Bank)
- 1 TPP (T01: Libyan Payment Network)
- File processing configurations for each
- Column mappings for card issuance data

Sample CSV file: `sample-data/B01_card_issuance_20250803.csv`

## Monitoring and Troubleshooting

### Logs
- Application logs show file processing activity
- Import logs table tracks processing status
- Failed imports include error messages

### Common Issues
1. **File not found**: Check directory path and file pattern
2. **Parsing errors**: Verify column mappings match CSV headers
3. **Database errors**: Check entity field types match data

## Development

### Project Structure
```
src/main/kotlin/com/payrep/
├── controller/          # REST controllers
├── domain/             # JPA entities
├── dto/                # Data transfer objects
├── repository/         # JPA repositories
├── service/            # Business logic
└── config/             # Configuration classes
```

### Testing
```bash
./gradlew test
```

## License

This project is part of the Central Bank of Libya data aggregation initiative.
