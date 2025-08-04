package com.payrep.controller

import com.payrep.dto.BankOrTppDto
import com.payrep.service.BankOrTPPService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/banks-and-tpps")
class BankOrTppController(private val service: BankOrTPPService) {

    @GetMapping
    fun getAll(): ResponseEntity<List<BankOrTppDto>> {
        return ResponseEntity.ok(service.getAll())
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ResponseEntity<BankOrTppDto> {
        val dto = service.getById(id)
        return if (dto != null) {
            ResponseEntity.ok(dto)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @PostMapping
    fun create(@RequestBody dto: BankOrTppDto): ResponseEntity<BankOrTppDto> {
        val createdDto = service.create(dto)
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDto)
    }

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody dto: BankOrTppDto): ResponseEntity<BankOrTppDto> {
        val updatedDto = service.update(id, dto)
        return if (updatedDto != null) {
            ResponseEntity.ok(updatedDto)
        } else {
            ResponseEntity.notFound().build()
        }
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        service.delete(id)
        return ResponseEntity.noContent().build()
    }
}
