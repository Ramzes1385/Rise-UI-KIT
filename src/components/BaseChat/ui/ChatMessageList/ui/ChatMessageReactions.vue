<template>
	<div
		v-if="reactions.length > 0"
		class="base-chat-message-list__reactions-display"
		:class="`base-chat-message-list__reactions-display--${sender}`"
		role="group"
		:aria-label="UI_CHAT_TEXT.REACTIONS_ARIA">
		<button
			v-for="reaction in reactions"
			:key="reaction.emoji"
			type="button"
			class="base-chat-message-list__reaction-badge"
			:class="{ 'base-chat-message-list__reaction-badge--active': isOwn(reaction) }"
			:aria-pressed="isOwn(reaction) ? 'true' : 'false'"
			:aria-label="`${UI_CHAT_TEXT.REACTION_ARIA} ${reaction.emoji}: ${reaction.users.length}`"
			@click.stop="handleClick(reaction.emoji)">
			<span class="base-chat-message-list__reaction-emoji" aria-hidden="true">{{ reaction.emoji }}</span>
			<span class="base-chat-message-list__reaction-count" aria-hidden="true">{{ reaction.users.length }}</span>
		</button>
	</div>
</template>

<script setup lang="ts">
import { UI_CHAT_TEXT } from '@/locales/messages'
import { useChatMessageReactions } from '../model/useChatMessageReactions'
import type { ChatMessageReactionsEmits, ChatMessageReactionsProps } from '../types/ChatMessageReactions.types'

defineProps<ChatMessageReactionsProps>()
const emit = defineEmits<ChatMessageReactionsEmits>()

const { isOwn, handleClick } = useChatMessageReactions(emit)
</script>
