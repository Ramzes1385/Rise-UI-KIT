<template>
	<BaseText v-if="text" tag="p" :size-scale="sizeScale" class="base-chat-message-list__text">
		<span v-for="(token, index) in highlightedTokens" :key="index">
			<a
				v-if="token.type === 'link'"
				:href="token.value"
				target="_blank"
				rel="noopener noreferrer"
				class="base-chat-message-list__link"
				@click.stop>
				{{ token.value }}
			</a>
			<button
				v-else-if="token.type === 'mention'"
				type="button"
				class="base-chat-message-list__mention"
				@click.stop="handleMentionClick(token.value)">
				{{ token.value }}
			</button>
			<button
				v-else-if="token.type === 'command'"
				type="button"
				class="base-chat-message-list__command"
				@click.stop="handleCommandClick(token.value)">
				{{ token.value }}
			</button>
			<template v-else>
				<span
					v-for="(part, partIndex) in token.highlightedParts"
					:key="partIndex"
					:class="{ 'base-chat-message-list__highlight': part.isMatch }">
					{{ part.text }}
				</span>
			</template>
		</span>
	</BaseText>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseText } from '@components/BaseText'
import { useMessageParser } from '@composables/useMessageParser'
import type { MessageToken, TextPart } from '@composables/useMessageParser/useMessageParser.types'

interface ChatMessageTextProps {
	text: string
	sizeScale: number
	searchQuery?: string
}

interface HighlightedToken extends MessageToken {
	highlightedParts: TextPart[]
}

const props = defineProps<ChatMessageTextProps>()
const emit = defineEmits<{
	(event: 'mention-click', mention: string): void
	(event: 'command-click', command: string): void
}>()

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
