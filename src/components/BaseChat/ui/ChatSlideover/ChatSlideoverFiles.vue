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
				:aria-label="formatMessage(UI_CHAT_TEXT.DOWNLOAD_FILE_NAMED, { name: file.name })"
				@click="emit('download-file', file)">
				<BaseIcon name="download" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
			</BaseButton>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseEmpty } from '@components/BaseEmpty'
import { CHAT_SCALE } from '../../model/chatScale'
import { BaseButton } from '@components/BaseButton'
import { getFileIconName } from '@utils/media/fileUtils'
import { useChatSlideoverFiles } from '../../model/slideover/useChatSlideoverFiles'
import type { ChatSlideoverFilesEmits, ChatSlideoverFilesProps } from '../../types/ChatSlideoverFiles.types'

const props = defineProps<ChatSlideoverFilesProps>()

const emit = defineEmits<ChatSlideoverFilesEmits>()

const { files } = useChatSlideoverFiles(props)
</script>
