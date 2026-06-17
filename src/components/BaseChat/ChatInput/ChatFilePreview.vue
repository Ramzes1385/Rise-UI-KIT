<template>
	<div class="base-chat-input__previews">
		<div v-for="(file, index) in attachments" :key="file.id" class="base-chat-input__preview">
			<BaseImage
				v-if="file.type === 'image'"
				:src="file.url"
				:alt="file.name"
				class="base-chat-input__preview-image" />
			<div v-else class="base-chat-input__preview-file">
				<BaseIcon name="file" :size-scale="sizeScale * UI_SCALE_SMALL" />
				<BaseText tag="span" :size-scale="sizeScale * UI_SCALE_SMALL" class="base-chat-input__preview-filename">
					{{ file.name }}
				</BaseText>
			</div>
			<BaseButton
				variant="ghost"
				:padding="1"
				:size-scale="sizeScale * UI_CHAT_SCALE_META"
				class="base-chat-input__preview-remove"
				:aria-label="`${UI_CHAT_REMOVE_ATTACHMENT} ${file.name}`"
				@click="handleRemove(index)">
				<template #left>
					<BaseIcon name="close" :size-scale="sizeScale * UI_CHAT_SCALE_META" />
				</template>
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { UI_CHAT_REMOVE_ATTACHMENT, UI_CHAT_SCALE_META, UI_SCALE_SMALL } from '@constants'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseText } from '@components/BaseText'
import type { ChatMessageAttachment } from '../BaseChat.types'

interface ChatFilePreviewProps {
	attachments: ChatMessageAttachment[]
	sizeScale: number
}

defineProps<ChatFilePreviewProps>()

const emit = defineEmits<{
	remove: [index: number]
}>()

function handleRemove(index: number): void {
	emit('remove', index)
}
</script>
