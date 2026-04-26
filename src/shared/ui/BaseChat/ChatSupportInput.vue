<template>
	<div class="base-chat__quick-replies">
		<BaseButton
			v-for="reply in quickReplies"
			:key="reply.value"
			variant="outline"
			class="base-chat__quick-reply"
			:size-scale="sizeScale"
			@click="handleQuickReply(reply.value)">
			{{ reply.label }}
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@/shared/ui/BaseButton'
import type { ChatQuickReply } from './BaseChat.types'

interface ChatSupportInputProps {
	quickReplies: ChatQuickReply[]
	sizeScale?: number
}

withDefaults(defineProps<ChatSupportInputProps>(), {
	sizeScale: 100,
})

const emit = defineEmits<{
	(event: 'quick-reply', value: string): void
}>()

function handleQuickReply(value: string): void {
	emit('quick-reply', value)
}
</script>
