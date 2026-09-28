<template>
	<div class="base-chat-header">
		<!-- Название и статус чата (когда не ищем) -->
		<div v-if="!isSearching" class="base-chat-header__info">
			<button
				v-if="avatar"
				type="button"
				class="base-chat-header__avatar-button"
				:aria-label="`${UI_CHAT_TEXT.PROFILE_ARIA} ${title}`"
				@click="handleAvatarClick">
				<BaseAvatar :src="avatar" :name="title" :size-scale="sizeScale" class="base-chat-header__avatar" />
			</button>
			<div class="base-chat-header__text">
				<span class="base-chat-header__title">{{ title }}</span>
				<span v-if="isTyping" class="base-chat-header__typing">
					{{ typingText }}<span class="base-chat-header__dots" aria-hidden="true">…</span>
				</span>
				<span v-else-if="subtitle" class="base-chat-header__subtitle">{{ subtitle }}</span>
			</div>
		</div>

		<!-- Поле поиска (когда активен поиск): Escape закрывает поиск -->
		<div v-else class="base-chat-header__search-container">
			<div class="base-chat-header__search-input">
				<BaseIcon name="search" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-header__search-icon" />
				<input
					ref="searchInputRef"
					type="search"
					class="base-chat-header__search-field"
					:value="searchQuery"
					:placeholder="UI_CHAT_TEXT.SEARCH_PLACEHOLDER"
					:aria-label="UI_CHAT_TEXT.SEARCH_ARIA"
					@input="handleSearchInput"
					@keydown.esc.prevent="handleSearchEscape" />
			</div>
		</div>

		<!-- Кнопки управления -->
		<div class="base-chat-header__actions">
			<BaseButton
				ref="searchToggleRef"
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-header__action-btn"
				:aria-label="isSearching ? UI_CHAT_TEXT.SEARCH_CLOSE : UI_CHAT_TEXT.SEARCH_ARIA"
				@click="handleToggleSearch">
				<BaseIcon :name="isSearching ? 'close' : 'search'" :size-scale="sizeScale" />
			</BaseButton>

			<BaseButton
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-header__action-btn"
				:aria-label="UI_CHAT_TEXT.INFO_ARIA"
				@click="handleInfoClick">
				<BaseIcon name="info" :size-scale="sizeScale" />
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { CHAT_SCALE } from '../../model/chatScale'
import './ChatHeader.style.scss'
import type { ChatHeaderEmits, ChatHeaderProps } from './ChatHeader.types'

const props = withDefaults(defineProps<ChatHeaderProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	isSearching: false,
	searchQuery: '',
	isTyping: false,
	typingUsername: '',
})

const emit = defineEmits<ChatHeaderEmits>()

const searchInputRef = ref<HTMLInputElement | null>(null)
const searchToggleRef = ref<{ focus: () => void } | null>(null)

/** «Анна печатает» в групповом чате, «Печатает» — в личном */
const typingText = computed(() =>
	props.typingUsername ? `${props.typingUsername} ${UI_CHAT_TEXT.TYPING_SUFFIX}` : UI_CHAT_TEXT.TYPING_LABEL,
)

/** Открытое поле поиска сразу получает фокус: можно печатать без лишнего клика */
watch(
	() => props.isSearching,
	isSearching => {
		if (isSearching) nextTick(() => searchInputRef.value?.focus())
	},
)

/** Обработка клика по аватару */
function handleAvatarClick(): void {
	emit('avatar-click')
}

/** Переключение режима поиска */
function handleToggleSearch(): void {
	emit('toggle-search')
}

/** Ввод поискового запроса */
function handleSearchInput(event: Event): void {
	emit('update:searchQuery', (event.target as HTMLInputElement).value)
}

/** Escape в поле поиска закрывает поиск и возвращает фокус на кнопку поиска */
function handleSearchEscape(): void {
	emit('toggle-search')
	nextTick(() => searchToggleRef.value?.focus())
}

/** Клик по кнопке информации */
function handleInfoClick(): void {
	emit('info-click')
}
</script>
