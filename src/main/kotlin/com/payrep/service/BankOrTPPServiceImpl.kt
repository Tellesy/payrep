package com.payrep.service

import com.payrep.domain.BankOrTPP
import com.payrep.dto.BankOrTppDto
import com.payrep.repository.BankOrTPPRepository
import org.springframework.stereotype.Service

@Service
class BankOrTPPServiceImpl(private val repository: BankOrTPPRepository) : BankOrTPPService {

    override fun getAll(): List<BankOrTppDto> {
        return repository.findAll().map { it.toDto() }
    }

    override fun getById(id: Long): BankOrTppDto? {
        return repository.findById(id).map { it.toDto() }.orElse(null)
    }

    override fun create(dto: BankOrTppDto): BankOrTppDto {
        val entity = dto.toEntity()
        return repository.save(entity).toDto()
    }

    override fun update(id: Long, dto: BankOrTppDto): BankOrTppDto? {
        return if (repository.existsById(id)) {
            val entity = dto.toEntity(id)
            repository.save(entity).toDto()
        } else {
            null
        }
    }

    override fun delete(id: Long) {
        repository.deleteById(id)
    }

    override fun findEntityById(id: Long): com.payrep.domain.BankOrTPP? {
        return repository.findById(id).orElse(null)
    }

    private fun BankOrTPP.toDto() = BankOrTppDto(
        id = this.id,
        code = this.code,
        name = this.name,
        type = this.type
    )

    private fun BankOrTppDto.toEntity(id: Long? = null) = BankOrTPP(
        id = id,
        code = this.code,
        name = this.name,
        type = this.type
    )
}
