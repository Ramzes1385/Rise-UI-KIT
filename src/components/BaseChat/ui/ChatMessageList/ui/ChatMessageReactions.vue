<template>
	<div
		v-if="reactions.length > 0"
		class="base-chat-message-list__reactions-display"
		:class="`base-chat-message-list__reactions-display--${sender}`"
		role="group"
		:aria-label="UI_CHAT_TEXT.REACTIONS_ARIA">
		<!-- Своя реакция — нажатая кнопка (aria-pressed): повторное нажатие снимает её -->
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
import { UI_CHAT_TEXT } from '@constants'
import type { ChatMessageReaction } from '../../../model/BaseChat.types'
import type { ChatMessageReactionsEmits, ChatMessageReactionsProps } from '../model/ChatMessageReactions.types'

defineProps<ChatMessageReactionsProps>()
const emit = defineEmits<ChatMessageReactionsEmits>()

/** Реакция текущего пользователя: в списке users он записан как 'me' */
function isOwn(reaction: ChatMessageReaction): boolean {
	return reaction.users.includes('me')
}

function handleClick(emoji: string): void {
	emit('toggle', emoji)
}
</script>
