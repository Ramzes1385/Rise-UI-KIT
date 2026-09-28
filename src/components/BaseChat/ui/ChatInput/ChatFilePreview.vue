<template>
	<ul class="base-chat-input__previews">
		<li v-for="(file, index) in attachments" :key="file.id" class="base-chat-input__preview">
			<BaseImage v-if="file.type === 'image'" :src="file.url" :alt="file.name" class="base-chat-input__preview-image" />
			<span v-else class="base-chat-input__preview-file" aria-hidden="true">
				<BaseIcon name="file" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
			</span>
			<span class="base-chat-input__preview-filename">{{ file.name }}</span>
			<BaseButton
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-input__preview-remove"
				:aria-label="`${UI_CHAT_TEXT.REMOVE_ATTACHMENT} ${file.name}`"
				@click="handleRemove(index)">
				<BaseIcon name="close" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
			</BaseButton>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { CHAT_SCALE } from '../../model/chatScale'
import type { ChatFilePreviewEmits, ChatFilePreviewProps } from './ChatFilePreview.types'

defineProps<ChatFilePreviewProps>()

const emit = defineEmits<ChatFilePreviewEmits>()

function handleRemove(index: number): void {
	emit('remove', index)
}
</script>
