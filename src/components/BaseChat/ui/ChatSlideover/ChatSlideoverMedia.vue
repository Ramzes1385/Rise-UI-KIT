<template>
	<div v-if="media.length === 0" class="base-chat-slideover__empty">
		<BaseIcon name="image" :size-scale="sizeScale * UI_CHAT_SCALE_AVATAR_LARGE" class="base-chat-slideover__empty-icon" />
		<BaseText :size-scale="sizeScale * UI_CHAT_SCALE_MEMBER" class="base-chat-slideover__empty-text">{{ UI_CHAT_NO_MEDIA }}</BaseText>
	</div>
	<div v-else class="base-chat-slideover__media-grid">
		<div v-for="item in media" :key="item.id" class="base-chat-slideover__media-item">
			<BaseImage
				:src="item.url"
				:alt="item.name"
				:gallery="imageUrls"
				:has-zoom="true"
				class="base-chat-slideover__media-thumbnail" />
			<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE_META" class="base-chat-slideover__media-date">
				{{ item.publishedAt }}
			</BaseText>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { BaseText } from '@components/BaseText'
import { UI_CHAT_NO_MEDIA, UI_CHAT_SCALE_AVATAR_LARGE, UI_CHAT_SCALE_MEMBER, UI_CHAT_SCALE_META } from '@constants'
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
