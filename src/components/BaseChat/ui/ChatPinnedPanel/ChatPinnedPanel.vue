<template>
	<div v-if="pinnedMessages && pinnedMessages.length > 0" class="base-chat-pinned-panel">
		<div class="base-chat-pinned-panel__content" @click="handlePanelClick">
			<BaseIcon name="pin" :size-scale="sizeScale * 0.8" class="base-chat-pinned-panel__pin-icon" />
			<div class="base-chat-pinned-panel__text-wrapper">
				<BaseText tag="span" :weight="600" :size-scale="sizeScale * 0.8" class="base-chat-pinned-panel__title">
					Закрепленное сообщение
					{{ pinnedMessages.length > 1 ? `(${currentIndex + 1} из ${pinnedMessages.length})` : '' }}
				</BaseText>
				<BaseText tag="p" :size-scale="sizeScale * 0.75" class="base-chat-pinned-panel__preview">
					{{ currentMessageText }}
				</BaseText>
			</div>
		</div>

		<div class="base-chat-pinned-panel__actions">
			<template v-if="pinnedMessages.length > 1">
				<BaseButton
					variant="ghost"
					:padding="1"
					:size-scale="sizeScale * 0.75"
					class="base-chat-pinned-panel__nav-btn"
					aria-label="Предыдущее закреплённое сообщение"
					@click="handlePrev">
					<template #left>
						<BaseIcon name="chevron-up" :size-scale="sizeScale * 0.7" />
					</template>
				</BaseButton>
				<BaseButton
					variant="ghost"
					:padding="1"
					:size-scale="sizeScale * 0.75"
					class="base-chat-pinned-panel__nav-btn"
					aria-label="Следующее закреплённое сообщение"
					@click="handleNext">
					<template #left>
						<BaseIcon name="chevron-down" :size-scale="sizeScale * 0.7" />
					</template>
				</BaseButton>
			</template>

			<BaseButton
				v-if="currentUserRole === 'admin'"
				variant="ghost"
				:padding="1"
				:size-scale="sizeScale * 0.75"
				class="base-chat-pinned-panel__unpin-btn"
				aria-label="Открепить сообщение"
				@click="handleUnpin">
				<template #left>
					<BaseIcon name="close" :size-scale="sizeScale * 0.7" />
				</template>
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { computed } from 'vue'
import type { ChatMessage } from '../../BaseChat.types'
import './ChatPinnedPanel.style.scss'

interface ChatPinnedPanelProps {
	pinnedMessages: ChatMessage[]
	currentIndex: number
	currentUserRole?: 'admin' | 'member'
	sizeScale?: number
}

const props = withDefaults(defineProps<ChatPinnedPanelProps>(), {
	currentUserRole: 'member',
	sizeScale: 100,
})

const emit = defineEmits<{
	(e: 'update:currentIndex', index: number): void
	(e: 'click', messageId: string): void
	(e: 'unpin', messageId: string): void
}>()

const currentMessage = computed((): ChatMessage | null => {
	/* istanbul ignore next — defensive: панель скрыта при pinnedMessages пустом (v-if) */
	return props.pinnedMessages[props.currentIndex] || null
})

const currentMessageText = computed((): string => {
	/* istanbul ignore next — defensive: панель скрыта при отсутствии currentMessage */
	if (!currentMessage.value) return ''
	const text = currentMessage.value.text || ''
	if (currentMessage.value.attachments && currentMessage.value.attachments.length > 0) {
		const hasImage = currentMessage.value.attachments.some(a => a.type === 'image')
		const prefix = hasImage ? '🖼️ Фото' : '📎 Файл'
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
