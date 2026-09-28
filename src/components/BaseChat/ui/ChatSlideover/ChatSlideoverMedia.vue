<template>
	<BaseEmpty
		v-if="media.length === 0"
		variant="ghost"
		icon="image"
		:title="UI_CHAT_TEXT.NO_MEDIA"
		:size-scale="sizeScale"
		class="base-chat-slideover__empty" />
	<ul v-else class="base-chat-slideover__media-grid">
		<li v-for="item in media" :key="item.id" class="base-chat-slideover__media-item">
			<BaseImage
				:src="item.url"
				:alt="item.name"
				:gallery="imageUrls"
				:zoom-config="{ hasZoom: true }"
				class="base-chat-slideover__media-thumbnail" />
			<span class="base-chat-slideover__media-date">{{ item.publishedAt }}</span>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseImage } from '@components/BaseImage'
import type { ChatMessage, ChatMessageAttachment } from '../../model/BaseChat.types'
import type { ChatSlideoverMediaProps } from '../../model/ChatSlideoverMedia.types'

interface SharedAttachment extends ChatMessageAttachment {
	publishedAt: string
}

const props = defineProps<ChatSlideoverMediaProps>()

function getPublishedLabel(message: ChatMessage): string {
	return message.date || message.time
}

const media = computed((): SharedAttachment[] => {
	const result: SharedAttachment[] = []
	for (const message of props.messages) {
		for (const attachment of message.attachments ?? []) {
			if (attachment.type === 'image') {
				result.push({ ...attachment, publishedAt: getPublishedLabel(message) })
			}
		}
	}
	return result
})

const imageUrls = computed((): string[] => {
	return media.value.map(item => item.url)
})
</script>
