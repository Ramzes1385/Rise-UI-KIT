<template>
	<Teleport to="body">
		<div
			v-if="isOpen"
			ref="menuRef"
			class="base-chat-context-menu"
			:style="{ top: `${y}px`, left: `${x}px` }">
			<div class="base-chat-context-menu__reactions">
				<button
					v-for="emoji in props.popularEmojis"
					:key="emoji"
					type="button"
					class="base-chat-context-menu__reaction-btn"
					:aria-label="`${UI_CHAT_ADD_REACTION} ${emoji}`"
					@click="handleReaction(emoji)">
					{{ emoji }}
				</button>
			</div>
			<div class="base-chat-context-menu__divider"></div>
			<button type="button" class="base-chat-context-menu__item" :aria-label="UI_CHAT_REPLY" @click="handleReply">
				<BaseIcon name="reply" :size-scale="sizeScale * UI_SCALE_SMALL" />
				<BaseText :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER">{{ UI_CHAT_REPLY }}</BaseText>
			</button>
			<button type="button" class="base-chat-context-menu__item" :aria-label="UI_CHAT_SELECT" @click="handleSelect">
				<BaseIcon name="check" :size-scale="sizeScale * UI_SCALE_SMALL" />
				<BaseText :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER">{{ UI_CHAT_SELECT }}</BaseText>
			</button>
			<button type="button" class="base-chat-context-menu__item" :aria-label="UI_CHAT_COPY_TEXT" @click="handleCopy">
				<BaseIcon name="copy" :size-scale="sizeScale * UI_SCALE_SMALL" />
				<BaseText :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER">{{ UI_CHAT_COPY_TEXT }}</BaseText>
			</button>
			<button
				v-if="currentUserRole === 'admin'"
				type="button"
				class="base-chat-context-menu__item"
				:aria-label="message?.isPinned ? UI_CHAT_UNPIN : UI_CHAT_PIN"
				@click="handlePin">
				<BaseIcon :name="message?.isPinned ? 'unpin' : 'pin'" :size-scale="sizeScale * UI_SCALE_SMALL" />
				<BaseText :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER">
					{{ message?.isPinned ? UI_CHAT_UNPIN : UI_CHAT_PIN }}
				</BaseText>
			</button>
			<button
				v-if="currentUserRole === 'admin' || message?.sender === 'me'"
				type="button"
				class="base-chat-context-menu__item base-chat-context-menu__item--danger"
				:aria-label="UI_CHAT_DELETE"
				@click="handleDelete">
				<BaseIcon name="trash" :size-scale="sizeScale * UI_SCALE_SMALL" />
				<BaseText :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER">{{ UI_CHAT_DELETE }}</BaseText>
			</button>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { UI_CHAT_ADD_REACTION, UI_CHAT_COPY_TEXT, UI_CHAT_DELETE, UI_CHAT_PIN, UI_CHAT_REPLY, UI_CHAT_SCALE_MEMBER, UI_CHAT_SELECT, UI_CHAT_UNPIN, UI_SCALE_SMALL } from '@constants'
import { ref } from 'vue'
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

const props = withDefaults(defineProps<ChatMessageContextMenuProps>(), {
	popularEmojis: () => ['👍', '❤️', '🔥', '😂', '😮', '😢'],
})

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
