<template>
	<div class="base-chat__input-area">
		<slot>
			<BaseButton
				v-if="hasAttachInput"
				variant="ghost"
				class="base-chat__attach-btn"
				:size-scale="sizeScale"
				@click="handleAttach">
				<BaseIcon name="attach" size="sm" :size-scale="sizeScale" />
			</BaseButton>
			<input
				:value="modelValue"
				type="text"
				class="base-chat__input"
				:placeholder="placeholder"
				@input="handleInput"
				@keydown.enter="handleSend" />
			<BaseButton
				v-if="hasVoiceInput"
				variant="ghost"
				class="base-chat__voice-input-btn"
				:size-scale="sizeScale"
				@click="handleVoiceInput">
				<BaseIcon name="mic" size="sm" :size-scale="sizeScale" />
			</BaseButton>
			<BaseButton
				variant="default"
				class="base-chat__send-btn"
				:is-disabled="!modelValue.trim()"
				:size-scale="sizeScale"
				@click="handleSend">
				<BaseIcon name="send" size="sm" :size-scale="sizeScale" />
			</BaseButton>
		</slot>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'

interface ChatInputProps {
	modelValue: string
	placeholder?: string
	hasVoiceInput?: boolean
	hasAttachInput?: boolean
	sizeScale?: number
}

withDefaults(defineProps<ChatInputProps>(), {
	sizeScale: 100,
})

const emit = defineEmits<{
	(event: 'update:modelValue', value: string): void
	(event: 'send'): void
	(event: 'send-voice'): void
	(event: 'send-file'): void
}>()

function handleInput(e: Event): void {
	const target = e.target as HTMLInputElement
	emit('update:modelValue', target.value)
}

function handleSend(): void {
	emit('send')
}

function handleVoiceInput(): void {
	emit('send-voice')
}

function handleAttach(): void {
	emit('send-file')
}
</script>
