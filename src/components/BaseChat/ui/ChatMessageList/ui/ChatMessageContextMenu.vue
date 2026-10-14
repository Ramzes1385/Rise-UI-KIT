<template>
	<Teleport defer :to="teleportTarget">
		<div
			v-if="isOpen"
			ref="menuRef"
			class="base-chat-context-menu"
			role="menu"
			:aria-label="UI_CHAT_TEXT.MESSAGE_ACTIONS"
			:style="[menuStyle, layerStyle]"
			v-bind="inheritedTheme"
			@keydown="handleKeydown">
			<div class="base-chat-context-menu__reactions" role="group" :aria-label="UI_CHAT_TEXT.REACTIONS_ARIA">
				<button
					v-for="emoji in popularEmojis"
					:key="emoji"
					type="button"
					role="menuitem"
					tabindex="-1"
					class="base-chat-context-menu__reaction-btn"
					:aria-label="`${UI_CHAT_TEXT.ADD_REACTION} ${emoji}`"
					@click="handleReaction(emoji)">
					{{ emoji }}
				</button>
			</div>
			<div class="base-chat-context-menu__divider" role="separator"></div>
			<button type="button" role="menuitem" tabindex="-1" class="base-chat-context-menu__item" @click="handleReply">
				<BaseIcon name="reply" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-context-menu__icon" />
				<span>{{ UI_CHAT_TEXT.REPLY }}</span>
			</button>
			<button type="button" role="menuitem" tabindex="-1" class="base-chat-context-menu__item" @click="handleSelect">
				<BaseIcon name="check" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-context-menu__icon" />
				<span>{{ UI_CHAT_TEXT.SELECT }}</span>
			</button>
			<button type="button" role="menuitem" tabindex="-1" class="base-chat-context-menu__item" @click="handleCopy">
				<BaseIcon name="copy" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-context-menu__icon" />
				<span>{{ UI_CHAT_TEXT.COPY }}</span>
			</button>
			<button
				v-if="message?.sender === 'me' && message.text"
				type="button"
				role="menuitem"
				tabindex="-1"
				class="base-chat-context-menu__item"
				@click="handleEdit">
				<BaseIcon name="edit" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-context-menu__icon" />
				<span>{{ UI_CHAT_TEXT.EDIT }}</span>
			</button>
			<button
				v-if="currentUserRole === 'admin'"
				type="button"
				role="menuitem"
				tabindex="-1"
				class="base-chat-context-menu__item"
				@click="handlePin">
				<BaseIcon
					:name="message?.isPinned ? 'unpin' : 'pin'"
					:size-scale="sizeScale * CHAT_SCALE.SMALL"
					class="base-chat-context-menu__icon" />
				<span>{{ message?.isPinned ? UI_CHAT_TEXT.UNPIN : UI_CHAT_TEXT.PIN }}</span>
			</button>
			<button
				v-if="currentUserRole === 'admin' || message?.sender === 'me'"
				type="button"
				role="menuitem"
				tabindex="-1"
				class="base-chat-context-menu__item base-chat-context-menu__item--danger"
				@click="handleDelete">
				<BaseIcon name="trash" :size-scale="sizeScale * CHAT_SCALE.SMALL" class="base-chat-context-menu__icon" />
				<span>{{ UI_CHAT_TEXT.DELETE }}</span>
			</button>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { CHAT_SCALE } from '../../../model/chatScale'
import { useChatMessageContextMenu } from '../model/contextMenu/useChatMessageContextMenu'
import type { ChatMessageContextMenuEmits, ChatMessageContextMenuProps } from '../types/ChatMessageContextMenu.types'

const props = withDefaults(defineProps<ChatMessageContextMenuProps>(), {
	popularEmojis: () => ['👍', '❤️', '🔥', '😂', '😮', '😢'],
})

const emit = defineEmits<ChatMessageContextMenuEmits>()

const {
	teleportTarget,
	menuRef,
	inheritedTheme,
	layerStyle,
	menuStyle,
	handleKeydown,
	handleReaction,
	handleReply,
	handleSelect,
	handleCopy,
	handleEdit,
	handlePin,
	handleDelete,
	exposed,
} = useChatMessageContextMenu(props, emit)

defineExpose(exposed)
</script>
