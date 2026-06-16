<template>
	<div v-if="files.length === 0" class="base-chat-slideover__empty">
		<BaseIcon name="file" :size-scale="sizeScale * UI_CHAT_SCALE_AVATAR_LARGE" class="base-chat-slideover__empty-icon" />
		<BaseText :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__empty-text">{{ UI_CHAT_NO_FILES }}</BaseText>
	</div>
	<div v-else class="base-chat-slideover__files-list">
		<div
			v-for="file in files"
			:key="file.id"
			class="base-chat-slideover__file-item"
			@click="emit('file-click', file)">
			<BaseIcon
				:name="getFileIconName(file.name)"
				:size-scale="sizeScale * UI_CHAT_SCALE_FILE_ICON"
				class="base-chat-slideover__file-icon" />
			<div class="base-chat-slideover__file-info">
				<BaseText tag="span" :weight="UI_FONT_WEIGHT_SEMIBOLD" :size-scale="sizeScale * UI_SCALE_AUTOCOMPLETE" class="base-chat-slideover__file-name">
					{{ file.name }}
				</BaseText>
				<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE_ICON" class="base-chat-slideover__file-meta">
					<template v-if="file.size">{{ file.size }} · </template>{{ file.publishedAt }}
				</BaseText>
			</div>
			<BaseIcon
				name="download"
				:size-scale="sizeScale * UI_SCALE_SMALL"
				class="base-chat-slideover__file-download"
				@click.stop="emit('download-file', file)" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import {
	UI_CHAT_NO_FILES,
	UI_CHAT_SCALE_AVATAR_LARGE,
	UI_CHAT_SCALE_FILE_ICON,
	UI_CHAT_SCALE_ICON,
	UI_CHAT_SCALE_MEMBER,
	UI_FONT_WEIGHT_SEMIBOLD,
	UI_SCALE_AUTOCOMPLETE,
	UI_SCALE_SMALL,
} from '@constants'
import { getFileIconName } from '@utils/fileUtils'
import { computed } from 'vue'
import type { ChatMessage, ChatMessageAttachment } from '../../BaseChat.types'

interface SharedAttachment extends ChatMessageAttachment {
	publishedAt: string
}

const props = defineProps<{
	messages: ChatMessage[]
	sizeScale: number
}>()

const emit = defineEmits<{
	'file-click': [file: ChatMessageAttachment]
	'download-file': [file: ChatMessageAttachment]
}>()

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
