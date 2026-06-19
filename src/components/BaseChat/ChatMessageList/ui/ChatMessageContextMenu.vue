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
					:aria-label="`${UI_CHAT_TEXT.ADD_REACTION} ${emoji}`"
					@click="handleReaction(emoji)">
					{{ emoji }}
				</button>
			</div>
			<div class="base-chat-context-menu__divider"></div>
		<button type="button" class="base-chat-context-menu__item" :aria-label="UI_CHAT_TEXT.REPLY" @click="handleReply">
			<BaseIcon name="reply" :size-scale="sizeScale * UI_SCALE.SMALL" />
			<BaseText :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER">{{ UI_CHAT_TEXT.REPLY }}</BaseText>
		</button>
		<button type="button" class="base-chat-context-menu__item" :aria-label="UI_CHAT_TEXT.SELECT" @click="handleSelect">
			<BaseIcon name="check" :size-scale="sizeScale * UI_SCALE.SMALL" />
			<BaseText :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER">{{ UI_CHAT_TEXT.SELECT }}</BaseText>
		</button>
		<button type="button" class="base-chat-context-menu__item" :aria-label="UI_CHAT_TEXT.COPY" @click="handleCopy">
			<BaseIcon name="copy" :size-scale="sizeScale * UI_SCALE.SMALL" />
			<BaseText :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER">{{ UI_CHAT_TEXT.COPY }}</BaseText>
		</button>
			<button
				v-if="currentUserRole === 'admin'"
				type="button"
				class="base-chat-context-menu__item"
			:aria-label="message?.isPinned ? UI_CHAT_TEXT.UNPIN : UI_CHAT_TEXT.PIN"
			@click="handlePin">
			<BaseIcon :name="message?.isPinned ? 'unpin' : 'pin'" :size-scale="sizeScale * UI_SCALE.SMALL" />
			<BaseText :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER">
				{{ message?.isPinned ? UI_CHAT_TEXT.UNPIN : UI_CHAT_TEXT.PIN }}
			</BaseText>
			</button>
			<button
				v-if="currentUserRole === 'admin' || message?.sender === 'me'"
				type="button"
				class="base-chat-context-menu__item base-chat-context-menu__item--danger"
			:aria-label="UI_CHAT_TEXT.DELETE"
			@click="handleDelete">
			<BaseIcon name="trash" :size-scale="sizeScale * UI_SCALE.SMALL" />
			<BaseText :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER">{{ UI_CHAT_TEXT.DELETE }}</BaseText>
			</button>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import {
	UI_CHAT_SCALE,
	UI_CHAT_TEXT,
	UI_SCALE,
} from '@constants'
import type { ChatMessageContextMenuEmits, ChatMessageContextMenuProps } from '../model/ChatMessageContextMenu.types'

withDefaults(defineProps<ChatMessageContextMenuProps>(), {
	popularEmojis: () => ['👍', '❤️', '🔥', '😂', '😮', '😢'],
})

const emit = defineEmits<ChatMessageContextMenuEmits>()

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
