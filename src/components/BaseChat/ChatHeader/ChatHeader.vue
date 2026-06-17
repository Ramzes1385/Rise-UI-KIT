<template>
	<div class="base-chat-header">
		<!-- Обычный заголовок (когда не ищем) -->
		<div v-if="!isSearching" class="base-chat-header__info">
			<BaseAvatar
				v-if="avatar"
				:src="avatar"
				:name="title"
				:size-scale="sizeScale"
				class="base-chat-header__avatar"
				@click="handleAvatarClick" />
			<div class="base-chat-header__text">
				<BaseText tag="span" :weight="UI_FONT_WEIGHT_BOLD" :size-scale="sizeScale" class="base-chat-header__title">
					{{ title }}
				</BaseText>
				<div class="base-chat-header__status">
					<BaseText v-if="isTyping" tag="span" :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" class="base-chat-header__typing">
					{{ typingUsername ? `${typingUsername} ${UI_CHAT_TYPING_SUFFIX}` : UI_CHAT_TYPING_LABEL
					}}<span class="base-chat-header__dots">...</span>
					</BaseText>
					<BaseText v-else-if="subtitle" tag="span" :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" class="base-chat-header__subtitle">
						{{ subtitle }}
					</BaseText>
				</div>
			</div>
		</div>

		<!-- Поле поиска (когда активен поиск) -->
		<div v-else class="base-chat-header__search-container">
			<BaseInput
				:model-value="searchQuery"
				:placeholder="UI_CHAT_SEARCH_PLACEHOLDER"
				:size-scale="sizeScale * UI_CHAT_SCALE_MEMBER"
				class="base-chat-header__search-input"
				:aria-label="UI_CHAT_SEARCH_ARIA"
				@update:model-value="handleSearchInput">
				<template #prefix>
					<BaseIcon name="search" :size-scale="sizeScale * UI_SCALE.SMALL" />
				</template>
			</BaseInput>
		</div>

		<!-- Кнопки управления -->
		<div class="base-chat-header__actions">
			<BaseButton
				variant="ghost"
				:padding="1"
				:size-scale="sizeScale"
				class="base-chat-header__action-btn"
				:aria-label="isSearching ? UI_CHAT_SEARCH_CLOSE : UI_CHAT_SEARCH_ARIA"
				@click="handleToggleSearch">
				<template #left>
					<BaseIcon :name="isSearching ? 'close' : 'search'" :size-scale="sizeScale" />
				</template>
			</BaseButton>

			<BaseButton
				variant="ghost"
				:padding="1"
				:size-scale="sizeScale"
				class="base-chat-header__action-btn"
				:aria-label="UI_CHAT_INFO_ARIA"
				@click="handleInfoClick">
				<template #left>
					<BaseIcon name="info" :size-scale="sizeScale" />
				</template>
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseText } from '@components/BaseText'
import {
	UI_CHAT_INFO_ARIA,
	UI_CHAT_SCALE_MEMBER,
	UI_CHAT_SEARCH_ARIA,
	UI_CHAT_SEARCH_CLOSE,
	UI_CHAT_SEARCH_PLACEHOLDER,
	UI_CHAT_TYPING_LABEL,
	UI_CHAT_TYPING_SUFFIX,
	UI_FONT_WEIGHT_BOLD,
	UI_SCALE,
} from '@constants'
import './ChatHeader.style.scss'
import type { ChatHeaderEmits, ChatHeaderProps } from './ChatHeader.types'

withDefaults(defineProps<ChatHeaderProps>(), {
	sizeScale: 100,
	isSearching: false,
	searchQuery: '',
	isTyping: false,
	typingUsername: '',
})

const emit = defineEmits<ChatHeaderEmits>()

/** Обработка клика по аватару */
function handleAvatarClick(): void {
	emit('avatar-click')
}

/** Переключение режима поиска */
function handleToggleSearch(): void {
	emit('toggle-search')
}

/** Ввод поискового запроса */
function handleSearchInput(value: string): void {
	emit('update:searchQuery', value)
}

/** Клик по кнопке информации */
function handleInfoClick(): void {
	emit('info-click')
}
</script>
