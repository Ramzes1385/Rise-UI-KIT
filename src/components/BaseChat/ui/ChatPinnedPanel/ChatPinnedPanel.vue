<template>
	<div v-if="pinnedMessages && pinnedMessages.length > 0" class="base-chat-pinned-panel">
		<div class="base-chat-pinned-panel__content" @click="handlePanelClick">
			<BaseIcon name="pin" :size-scale="sizeScale * UI_SCALE.SMALL" class="base-chat-pinned-panel__pin-icon" />
			<div class="base-chat-pinned-panel__text-wrapper">
				<BaseText tag="span" :weight="UI_FONT_WEIGHT.SEMIBOLD" :size-scale="sizeScale * UI_SCALE.SMALL" class="base-chat-pinned-panel__title">
					{{ UI_CHAT_PINNED_MESSAGE }}
					{{ pinnedMessages.length > 1 ? `(${currentIndex + 1} ${UI_CHAT_PINNED_COUNTER} ${pinnedMessages.length})` : '' }}
				</BaseText>
				<BaseText tag="p" :size-scale="sizeScale * UI_CHAT_SCALE_ICON" class="base-chat-pinned-panel__preview">
					{{ currentMessageText }}
				</BaseText>
			</div>
		</div>

		<div class="base-chat-pinned-panel__actions">
			<template v-if="pinnedMessages.length > 1">
				<BaseButton
					variant="ghost"
					:padding="1"
					:size-scale="sizeScale * UI_CHAT_SCALE_ICON"
					class="base-chat-pinned-panel__nav-btn"
					:aria-label="UI_CHAT_PREV_PINNED_ARIA"
					@click="handlePrev">
					<template #left>
						<BaseIcon name="chevron-up" :size-scale="sizeScale * UI_CHAT_SCALE_META" />
					</template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					:padding="1"
					:size-scale="sizeScale * UI_CHAT_SCALE_ICON"
					class="base-chat-pinned-panel__nav-btn"
					:aria-label="UI_CHAT_NEXT_PINNED_ARIA"
					@click="handleNext">
					<template #left>
						<BaseIcon name="chevron-down" :size-scale="sizeScale * UI_CHAT_SCALE_META" />
					</template>
				</BaseButton>
			</template>

			<BaseButton
				v-if="currentUserRole === 'admin'"
				variant="ghost"
				:padding="1"
				:size-scale="sizeScale * UI_CHAT_SCALE_ICON"
				class="base-chat-pinned-panel__unpin-btn"
				:aria-label="UI_CHAT_UNPIN_ARIA"
				@click="handleUnpin">
				<template #left>
					<BaseIcon name="close" :size-scale="sizeScale * UI_CHAT_SCALE_META" />
				</template>
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import {
	UI_CHAT_FILE,
	UI_CHAT_NEXT_PINNED_ARIA,
	UI_CHAT_PHOTO,
	UI_CHAT_PINNED_COUNTER,
	UI_CHAT_PINNED_MESSAGE,
	UI_CHAT_PREV_PINNED_ARIA,
	UI_CHAT_SCALE_ICON,
	UI_CHAT_SCALE_META,
	UI_CHAT_UNPIN_ARIA,
	UI_FONT_WEIGHT,
	UI_SCALE,
	SIZE_SCALE_DEFAULT,
} from '@constants'
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
		const prefix = hasImage ? `🖼️ ${UI_CHAT_PHOTO}` : `📎 ${UI_CHAT_FILE}`
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
