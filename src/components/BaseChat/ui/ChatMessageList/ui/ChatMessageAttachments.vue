<template>
	<div v-if="attachments.length > 0" class="base-chat-message-list__attachments">
		<!-- Коллаж изображений: до 4 превью, на четвёртом — «+N» -->
		<div
			v-if="images.length > 0"
			class="base-chat-message-list__collage"
			:class="`base-chat-message-list__collage--count-${Math.min(images.length, 4)}`">
			<div v-for="(img, index) in images.slice(0, 4)" :key="img.id" class="base-chat-message-list__collage-item">
				<BaseImage
					:src="img.url"
					:alt="img.name"
					:gallery="gallery"
					:zoom-config="{ hasZoom: true }"
					class="base-chat-message-list__attached-image" />
				<div v-if="index === 3 && images.length > 4" class="base-chat-message-list__collage-overlay" aria-hidden="true">
					<span class="base-chat-message-list__collage-overlay-text">+{{ images.length - 3 }}</span>
				</div>
				<BaseButton
					variant="outline"
					:size-scale="sizeScale"
					class="base-chat-message-list__download-btn"
					:aria-label="`${UI_CHAT_TEXT.DOWNLOAD_IMAGE} ${img.name}`"
					@click.stop="handleDownload(img)">
					<BaseIcon name="download" :size-scale="sizeScale * UI_SCALE.SMALL" />
				</BaseButton>
			</div>
		</div>

		<!-- Файлы: карточка открывает файл, кнопка справа — скачивает -->
		<div v-if="files.length > 0" class="base-chat-message-list__files-list">
			<div v-for="file in files" :key="file.id" class="base-chat-message-list__attached-file">
				<button type="button" class="base-chat-message-list__attached-file-main" @click.stop="handleFileClick(file)">
					<span class="base-chat-message-list__file-icon" aria-hidden="true">
						<BaseIcon :name="getFileIconName(file.name)" :size-scale="sizeScale" />
					</span>
					<span class="base-chat-message-list__attached-file-info">
						<span class="base-chat-message-list__attached-file-name">{{ file.name }}</span>
						<span v-if="file.size" class="base-chat-message-list__attached-file-size">{{ file.size }}</span>
					</span>
				</button>
				<BaseButton
					variant="ghost"
					:size-scale="sizeScale"
					class="base-chat-message-list__download-btn"
					:aria-label="`${UI_CHAT_TEXT.DOWNLOAD_FILE} ${file.name}`"
					@click.stop="handleDownload(file)">
					<BaseIcon name="download" :size-scale="sizeScale * UI_SCALE.SMALL" />
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
import { UI_CHAT_TEXT, UI_SCALE } from '@constants'
import { getFileIconName } from '@utils/fileUtils'
import type { ChatMessageAttachment } from '../../../model/BaseChat.types'
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
