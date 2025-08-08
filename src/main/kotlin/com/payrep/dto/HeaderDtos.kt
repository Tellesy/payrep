package com.payrep.dto

import com.payrep.domain.HeaderAlias
import com.payrep.domain.HeaderDefinition

data class HeaderAliasDto(
    val id: Long?,
    val alias: String
) {
    companion object {
        fun fromEntity(entity: HeaderAlias) = HeaderAliasDto(
            id = entity.id,
            alias = entity.alias
        )
    }
}

data class HeaderDefinitionDto(
    val id: Long?,
    val entityType: String,
    val key: String,
    val displayName: String,
    val aliases: List<HeaderAliasDto> = emptyList()
) {
    companion object {
        fun fromEntity(entity: HeaderDefinition): HeaderDefinitionDto = HeaderDefinitionDto(
            id = entity.id,
            entityType = entity.entityType,
            key = entity.key,
            displayName = entity.displayName,
            aliases = entity.aliases.map { HeaderAliasDto.fromEntity(it) }
        )
    }
}
