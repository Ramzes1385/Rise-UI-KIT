<template>
	<div v-if="pinnedMessages && pinnedMessages.length > 0" class="base-chat-pinned-panel">
		<!-- Клик по панели прокручивает ленту к закреплённому сообщению -->
		<button type="button" class="base-chat-pinned-panel__content" @click="handlePanelClick">
			<BaseIcon name="pin" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-pinned-panel__pin-icon" />
			<span class="base-chat-pinned-panel__text-wrapper">
				<span class="base-chat-pinned-panel__title">
					{{ UI_CHAT_TEXT.PINNED_MESSAGE }}
					{{ pinnedMessages.length > 1 ? `(${currentIndex + 1} ${UI_CHAT_TEXT.PINNED_COUNTER} ${pinnedMessages.length})` : '' }}
				</span>
				<span class="base-chat-pinned-panel__preview">{{ currentMessageText }}</span>
			</span>
		</button>

		<div class="base-chat-pinned-panel__actions">
			<template v-if="pinnedMessages.length > 1">
				<BaseButton
					variant="ghost"
					:size-scale="sizeScale"
					class="base-chat-pinned-panel__nav-btn"
					:aria-label="UI_CHAT_TEXT.PREV_PINNED_ARIA"
					@click="handlePrev">
					<BaseIcon name="chevron-up" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
				</BaseButton>
				<BaseButton
					variant="ghost"
					:size-scale="sizeScale"
					class="base-chat-pinned-panel__nav-btn"
					:aria-label="UI_CHAT_TEXT.NEXT_PINNED_ARIA"
					@click="handleNext">
					<BaseIcon name="chevron-down" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
				</BaseButton>
			</template>

			<BaseButton
				v-if="currentUserRole === 'admin'"
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-pinned-panel__unpin-btn"
				:aria-label="UI_CHAT_TEXT.UNPIN_ARIA"
				@click="handleUnpin">
				<BaseIcon name="close" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { CHAT_SCALE } from '../../model/chatScale'
import type { ChatMessage } from '../../model/BaseChat.types'
import type { ChatPinnedPanelEmits, ChatPinnedPanelProps } from '../../model/ChatPinnedPanel.types'
import './ChatPinnedPanel.style.scss'

const props = withDefaults(defineProps<ChatPinnedPanelProps>(), {
	currentUserRole: 'member',
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<ChatPinnedPanelEmits>()

const currentMessage = computed((): ChatMessage | null => {
	/* istanbul ignore next — defensive: панель скрыта при pinnedMessages пустом (v-if) */
	return props.pinnedMessages[props.currentIndex] || null
})

const currentMessageText = computed((): string => {
	/* istanbul ignore next — defensive: панель скрыта при отсутствии currentMessage */
	if (!currentMessage.value) return ''
	const text = currentMessage.value.text || ''
	if (currentMessage.value.attachments && currentMessage.value.attachments.length > 0) {
		const hasImage = currentMessage.value.attachments.some(attachment => attachment.type === 'image')
		const prefix = hasImage ? `🖼️ ${UI_CHAT_TEXT.PHOTO}` : `📎 ${UI_CHAT_TEXT.FILE}`
		return text ? `${prefix}: ${text}` : prefix
	}
	return text
})

function handlePrev(): void {
	const len = props.pinnedMessages.length
	/* istanbul ignore next — defensive: navigation-кнопки скрыты при len <= 1 (v-if) */
	if (len <= 1) return
	const prevIndex = (props.currentIndex - 1 + len) % len
	emit('update:currentIndex', prevIndex)
}

function handleNext(): void {
	const len = props.pinnedMessages.length
	/* istanbul ignore next — defensive: navigation-кнопки скрыты при len <= 1 (v-if) */
	if (len <= 1) return
	const nextIndex = (props.currentIndex + 1) % len
	emit('update:currentIndex', nextIndex)
}

function handlePanelClick(): void {
	/* istanbul ignore next — defensive: панель скрыта при пустом currentMessage */
	if (currentMessage.value) {
		emit('click', currentMessage.value.id)
	}
}

function handleUnpin(): void {
	/* istanbul ignore next — defensive: unpin-кнопка скрыта при пустом currentMessage */
	if (currentMessage.value) {
		emit('unpin', currentMessage.value.id)
	}
}
</script>
