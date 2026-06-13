<template>
	<Teleport to="body">
		<div
			v-if="isOpen"
			ref="menuRef"
			class="base-chat-context-menu"
			:style="{ top: `${y}px`, left: `${x}px` }">
			<div class="base-chat-context-menu__reactions">
				<button
					v-for="emoji in popularEmojis"
					:key="emoji"
					type="button"
					class="base-chat-context-menu__reaction-btn"
					:aria-label="`Поставить реакцию ${emoji}`"
					@click="handleReaction(emoji)">
					{{ emoji }}
				</button>
			</div>
			<div class="base-chat-context-menu__divider"></div>
			<button type="button" class="base-chat-context-menu__item" @click="handleReply">
				<BaseIcon name="reply" :size-scale="sizeScale * 0.8" />
				<BaseText :size-scale="sizeScale * 0.9">Ответить</BaseText>
			</button>
			<button type="button" class="base-chat-context-menu__item" @click="handleSelect">
				<BaseIcon name="check" :size-scale="sizeScale * 0.8" />
				<BaseText :size-scale="sizeScale * 0.9">Выбрать</BaseText>
			</button>
			<button type="button" class="base-chat-context-menu__item" @click="handleCopy">
				<BaseIcon name="copy" :size-scale="sizeScale * 0.8" />
				<BaseText :size-scale="sizeScale * 0.9">Копировать текст</BaseText>
			</button>
			<button
				v-if="currentUserRole === 'admin'"
				type="button"
				class="base-chat-context-menu__item"
				@click="handlePin">
				<BaseIcon :name="message?.isPinned ? 'unpin' : 'pin'" :size-scale="sizeScale * 0.8" />
				<BaseText :size-scale="sizeScale * 0.9">
					{{ message?.isPinned ? 'Открепить' : 'Закрепить' }}
				</BaseText>
			</button>
			<button
				v-if="currentUserRole === 'admin' || message?.sender === 'me'"
				type="button"
				class="base-chat-context-menu__item base-chat-context-menu__item--danger"
				@click="handleDelete">
				<BaseIcon name="trash" :size-scale="sizeScale * 0.8" />
				<BaseText :size-scale="sizeScale * 0.9">Удалить</BaseText>
			</button>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { computed, ref } from 'vue'
import type { ChatMessage } from '../../BaseChat.types'

interface ChatMessageContextMenuProps {
	isOpen: boolean
	x: number
	y: number
	message: ChatMessage | null
	currentUserRole: 'admin' | 'member'
	sizeScale: number
	popularEmojis?: string[]
}

const props = defineProps<ChatMessageContextMenuProps>()

const popularEmojis = computed(() => props.popularEmojis ?? ['👍', '❤️', '🔥', '😂', '😮', '😢'])

const emit = defineEmits<{
	(event: 'reaction', emoji: string): void
	(event: 'reply'): void
	(event: 'select'): void
	(event: 'copy'): void
	(event: 'pin'): void
	(event: 'delete'): void
}>()

const menuRef = ref<HTMLElement | null>(null)

function handleReaction(emoji: string): void {
	emit('reaction', emoji)
}

function handleReply(): void {
	emit('reply')
}

function handleSelect(): void {
	emit('select')
}

function handleCopy(): void {
	emit('copy')
}

function handlePin(): void {
	emit('pin')
}

function handleDelete(): void {
	emit('delete')
}

defineExpose({
	menuRef,
})
</script>
