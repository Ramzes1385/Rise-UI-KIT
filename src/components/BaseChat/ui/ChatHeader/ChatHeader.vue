<template>
	<div class="base-chat-header">
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
import './ChatHeader.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { CHAT_SCALE } from '../../model/chatScale'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { useChatHeader } from './model/useChatHeader'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { ChatHeaderEmits, ChatHeaderProps } from './types/ChatHeader.types'

const props = withDefaults(defineProps<ChatHeaderProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	isSearching: false,
	searchQuery: '',
	isTyping: false,
	typingUsername: '',
})

const emit = defineEmits<ChatHeaderEmits>()

const {
	searchInputRef,
	searchToggleRef,
	typingText,
	handleAvatarClick,
	handleToggleSearch,
	handleSearchInput,
	handleSearchEscape,
	handleInfoClick,
} = useChatHeader(props, emit)
</script>
