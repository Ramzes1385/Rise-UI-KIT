<template>
	<div v-if="replyToId" class="base-chat-message-list__reply-quote" @click.stop="handleClick">
		<BaseText
			tag="span"
			:weight="600"
			:size-scale="sizeScale * 0.75"
			class="base-chat-message-list__reply-sender">
			{{ replyToSenderName || 'Сообщение' }}
		</BaseText>
		<BaseText tag="p" :size-scale="sizeScale * 0.75" class="base-chat-message-list__reply-text">
			{{ replyToText }}
		</BaseText>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'

interface ChatMessageReplyProps {
	replyToId?: string
	replyToSenderName?: string
	replyToText?: string
	sizeScale: number
}

const props = defineProps<ChatMessageReplyProps>()
const emit = defineEmits<{
	(event: 'click', replyToId: string): void
}>()

function handleClick(): void {
	/* istanbul ignore next — defensive: клик возможен только при наличии replyToId (v-if) */
	if (!props.replyToId) return
	emit('click', props.replyToId)
}
</script>
