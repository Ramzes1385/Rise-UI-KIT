<template>
	<div v-if="attachments.length > 0" class="base-chat-message-list__attachments">
		<!-- Коллаж изображений -->
		<div
			v-if="images.length > 0"
			class="base-chat-message-list__collage"
			:class="`base-chat-message-list__collage--count-${Math.min(images.length, 4)}`">
			<div v-for="(img, index) in images.slice(0, 4)" :key="img.id" class="base-chat-message-list__collage-item">
				<BaseImage
					:src="img.url"
					:alt="img.name"
					:gallery="gallery"
					:has-zoom="true"
					class="base-chat-message-list__attached-image" />
				<BaseButton
					variant="ghost"
					:padding="1"
				:size-scale="sizeScale * UI_CHAT_SCALE_ICON"
				class="base-chat-message-list__download-btn"
					:aria-label="`${UI_CHAT_DOWNLOAD_IMAGE} ${img.name}`"
					@click.stop="handleDownload(img)">
					<template #left>
						<BaseIcon name="download" :size-scale="sizeScale * UI_CHAT_SCALE_META" />
					</template>
				</BaseButton>
				<div v-if="index === 3 && images.length > 4" class="base-chat-message-list__collage-overlay">
					<BaseText
						:weight="UI_FONT_WEIGHT.SEMIBOLD"
						:size-scale="sizeScale * UI_CHAT_SCALE_FILE_ICON"
						class="base-chat-message-list__collage-overlay-text">
						+{{ images.length - 3 }}
					</BaseText>
				</div>
			</div>
		</div>

		<!-- Список файлов -->
		<div v-if="files.length > 0" class="base-chat-message-list__files-list">
			<div
				v-for="file in files"
				:key="file.id"
				class="base-chat-message-list__attached-file"
				@click.stop="handleFileClick(file)">
				<BaseIcon :name="getFileIconName(file.name)" :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-message-list__file-icon" />
				<div class="base-chat-message-list__attached-file-info">
					<BaseText
						tag="span"
						:size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE"
						:weight="UI_FONT_WEIGHT.SEMIBOLD"
						class="base-chat-message-list__attached-file-name">
						{{ file.name }}
					</BaseText>
					<BaseText
						v-if="file.size"
						tag="span"
						:size-scale="sizeScale * UI_CHAT_SCALE_ICON"
						class="base-chat-message-list__attached-file-size">
						{{ file.size }}
					</BaseText>
				</div>
				<BaseButton
					variant="ghost"
					:padding="1"
:size-scale="sizeScale * UI_CHAT_SCALE_ICON"
				class="base-chat-message-list__download-btn"
					:aria-label="`${UI_CHAT_DOWNLOAD_FILE} ${file.name}`"
					@click.stop="handleDownload(file)">
					<template #left>
						<BaseIcon name="download" :size-scale="sizeScale * UI_CHAT_SCALE_META" />
					</template>
				</BaseButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseText } from '@components/BaseText'
import {
	UI_CHAT_DOWNLOAD_FILE,
	UI_CHAT_DOWNLOAD_IMAGE,
	UI_CHAT_SCALE_FILE_ICON,
	UI_CHAT_SCALE_ICON,
	UI_CHAT_SCALE_MEMBER,
	UI_CHAT_SCALE_META,
	UI_FONT_WEIGHT,
	UI_SCALE,
} from '@constants'
import { getFileIconName } from '@utils/fileUtils'
import type { ChatMessageAttachment } from '../../model/BaseChat.types'
import type { ChatMessageAttachmentsEmits, ChatMessageAttachmentsProps } from '../model/ChatMessageAttachments.types'

const props = defineProps<ChatMessageAttachmentsProps>()
const emit = defineEmits<ChatMessageAttachmentsEmits>()

const images = computed(() => props.attachments.filter(attachment => attachment.type === 'image'))
const files = computed(() => props.attachments.filter(attachment => attachment.type !== 'image'))

function handleDownload(file: ChatMessageAttachment): void {
	emit('download', file)
}

function handleFileClick(file: ChatMessageAttachment): void {
	emit('file-click', file)
}
</script>
