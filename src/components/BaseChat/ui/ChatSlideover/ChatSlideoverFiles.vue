<template>
	<BaseEmpty
		v-if="files.length === 0"
		variant="ghost"
		icon="file"
		:title="UI_CHAT_TEXT.NO_FILES"
		:size-scale="sizeScale"
		class="base-chat-slideover__empty" />
	<ul v-else class="base-chat-slideover__files-list">
		<li v-for="file in files" :key="file.id" class="base-chat-slideover__file-item">
			<button type="button" class="base-chat-slideover__file-main" @click="emit('file-click', file)">
				<span class="base-chat-slideover__file-icon" aria-hidden="true">
					<BaseIcon :name="getFileIconName(file.name)" :size-scale="sizeScale" />
				</span>
				<span class="base-chat-slideover__file-info">
					<span class="base-chat-slideover__file-name">{{ file.name }}</span>
					<span class="base-chat-slideover__file-meta"
						><template v-if="file.size">{{ file.size }} · </template>{{ file.publishedAt }}</span
					>
				</span>
			</button>
			<BaseButton
				variant="ghost"
				:size-scale="sizeScale"
				class="base-chat-slideover__file-download"
				:aria-label="`${UI_CHAT_TEXT.DOWNLOAD_FILE} ${file.name}`"
				@click="emit('download-file', file)">
				<BaseIcon name="download" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
			</BaseButton>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseEmpty } from '@components/BaseEmpty'
import { getFileIconName } from '@utils/fileUtils'
import { BaseButton } from '@components/BaseButton'
import { CHAT_SCALE } from '../../model/chatScale'
import type { ChatMessage } from '../../types/BaseChat.types'
import type { SharedAttachment } from '../../types/ChatSlideover.types'
import type { ChatSlideoverFilesEmits, ChatSlideoverFilesProps } from '../../types/ChatSlideoverFiles.types'

const props = defineProps<ChatSlideoverFilesProps>()

const emit = defineEmits<ChatSlideoverFilesEmits>()

function getPublishedLabel(message: ChatMessage): string {
	return message.date || message.time
}

const files = computed((): SharedAttachment[] => {
	const result: SharedAttachment[] = []
	for (const message of props.messages) {
		for (const attachment of message.attachments ?? []) {
			if (attachment.type === 'file') {
				result.push({ ...attachment, publishedAt: getPublishedLabel(message) })
			}
		}
	}
	return result
})
</script>
