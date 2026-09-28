<template>
	<p v-if="text" class="base-chat-message-list__text">
		<template v-for="(token, index) in highlightedTokens" :key="index"
			><a
				v-if="token.type === 'link'"
				:href="token.value"
				target="_blank"
				rel="noopener noreferrer"
				class="base-chat-message-list__link"
				@click.stop
				>{{ token.value }}</a
			><button
				v-else-if="token.type === 'mention'"
				type="button"
				class="base-chat-message-list__mention"
				@click.stop="handleMentionClick(token.value)">
				{{ token.value }}</button
			><button
				v-else-if="token.type === 'command'"
				type="button"
				class="base-chat-message-list__command"
				@click.stop="handleCommandClick(token.value)">
				{{ token.value }}</button
			><template v-else
				><template v-for="(part, partIndex) in token.highlightedParts" :key="partIndex"
					><mark v-if="part.isMatch" class="base-chat-message-list__highlight">{{ part.text }}</mark
					><template v-else>{{ part.text }}</template></template
				></template
			></template
		>
	</p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMessageParser } from '@composables/useMessageParser'
import type { ChatMessageTextEmits, ChatMessageTextProps, HighlightedToken } from '../model/ChatMessageText.types'

/*
 * Токены в шаблоне записаны в одну строку, без пробелов между тегами: текст сообщения выводится с white-space: pre-wrap,
 * и любой пробел из разметки стал бы виден. Совпадения поиска — <mark>, ссылки — <a>, упоминания и команды — кнопки.
 */
const props = defineProps<ChatMessageTextProps>()
const emit = defineEmits<ChatMessageTextEmits>()

const { getHighlightedParts, parseMessageText } = useMessageParser({
	searchQuery: () => props.searchQuery ?? '',
})

const highlightedTokens = computed<HighlightedToken[]>(() =>
	parseMessageText(props.text).map(token => ({
		...token,
		highlightedParts: token.type === 'text' ? getHighlightedParts(token.value) : [],
	})),
)

function handleMentionClick(mention: string): void {
	emit('mention-click', mention.slice(1))
}

function handleCommandClick(command: string): void {
	emit('command-click', command.slice(1))
}
</script>
