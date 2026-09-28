<template>
	<button v-if="replyToId" type="button" class="base-chat-message-list__reply-quote" @click.stop="handleClick">
		<span class="base-chat-message-list__reply-sender">{{ replyToSenderName || UI_CHAT_TEXT.MESSAGE_PLACEHOLDER }}</span>
		<span class="base-chat-message-list__reply-text">{{ replyToText }}</span>
	</button>
</template>

<script setup lang="ts">
import { UI_CHAT_TEXT } from '@/locales/messages'
import { useChatMessageReply } from '../model/useChatMessageReply'
import type { ChatMessageReplyEmits, ChatMessageReplyProps } from '../types/ChatMessageReply.types'

/** Цитата сообщения, на которое ответили: клик прокручивает ленту к оригиналу */
const props = defineProps<ChatMessageReplyProps>()
const emit = defineEmits<ChatMessageReplyEmits>()

const { handleClick } = useChatMessageReply(props, emit)
</script>
