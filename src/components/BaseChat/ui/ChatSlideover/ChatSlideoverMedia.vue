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
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseImage } from '@components/BaseImage'
import { useChatSlideoverMedia } from '../../model/slideover/useChatSlideoverMedia'
import type { ChatSlideoverMediaProps } from '../../types/ChatSlideoverMedia.types'

const props = defineProps<ChatSlideoverMediaProps>()

const { media, imageUrls } = useChatSlideoverMedia(props)
</script>
