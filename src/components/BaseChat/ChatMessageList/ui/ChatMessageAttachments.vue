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
					:size-scale="sizeScale * 0.75"
					class="base-chat-message-list__download-btn"
					:aria-label="`Скачать изображение ${img.name}`"
					@click.stop="handleDownload(img)">
					<template #left>
						<BaseIcon name="download" :size-scale="sizeScale * 0.7" />
					</template>
				</BaseButton>
				<div v-if="index === 3 && images.length > 4" class="base-chat-message-list__collage-overlay">
					<BaseText
						:weight="600"
						:size-scale="sizeScale * 1.2"
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
				<BaseIcon :name="getFileIconName(file.name)" :size-scale="sizeScale * 0.9" class="base-chat-message-list__file-icon" />
				<div class="base-chat-message-list__attached-file-info">
					<BaseText
						tag="span"
						:size-scale="sizeScale * 0.85"
						:weight="600"
						class="base-chat-message-list__attached-file-name">
						{{ file.name }}
					</BaseText>
					<BaseText
						v-if="file.size"
						tag="span"
						:size-scale="sizeScale * 0.75"
						class="base-chat-message-list__attached-file-size">
						{{ file.size }}
					</BaseText>
				</div>
				<BaseButton
					variant="ghost"
					:padding="1"
					:size-scale="sizeScale * 0.75"
					class="base-chat-message-list__download-btn"
					:aria-label="`Скачать файл ${file.name}`"
					@click.stop="handleDownload(file)">
					<template #left>
						<BaseIcon name="download" :size-scale="sizeScale * 0.7" />
					</template>
				</BaseButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseIcon } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseText } from '@components/BaseText'
import { getFileIconName } from '@utils/fileUtils'
import { computed } from 'vue'
import type { ChatMessageAttachment } from '../../BaseChat.types'

interface ChatMessageAttachmentsProps {
	attachments: ChatMessageAttachment[]
	sizeScale: number
	gallery?: string[]
}

const props = defineProps<ChatMessageAttachmentsProps>()
const emit = defineEmits<{
	(event: 'download', file: ChatMessageAttachment): void
	(event: 'file-click', file: ChatMessageAttachment): void
}>()

const images = computed(() => props.attachments.filter(attachment => attachment.type === 'image'))
const files = computed(() => props.attachments.filter(attachment => attachment.type !== 'image'))

function handleDownload(file: ChatMessageAttachment): void {
	emit('download', file)
}

function handleFileClick(file: ChatMessageAttachment): void {
	emit('file-click', file)
}
</script>
