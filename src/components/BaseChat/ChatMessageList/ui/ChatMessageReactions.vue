<template>
	<div v-if="reactions.length > 0" class="base-chat-message-list__reactions-display" :class="`base-chat-message-list__reactions-display--${sender}`">
		<div
			v-for="reaction in reactions"
			:key="reaction.emoji"
			class="base-chat-message-list__reaction-badge"
			:class="{ 'base-chat-message-list__reaction-badge--active': reaction.users.includes('me') }"
			@click.stop="handleClick(reaction.emoji)">
			<span class="base-chat-message-list__reaction-emoji">{{ reaction.emoji }}</span>
			<span class="base-chat-message-list__reaction-count">{{ reaction.users.length }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ChatMessageReaction } from '../../model/BaseChat.types'

interface ChatMessageReactionsProps {
	reactions: ChatMessageReaction[]
	sender: 'me' | 'other'
}

defineProps<ChatMessageReactionsProps>()
const emit = defineEmits<{
	(event: 'toggle', emoji: string): void
}>()

function handleClick(emoji: string): void {
	emit('toggle', emoji)
}
</script>
