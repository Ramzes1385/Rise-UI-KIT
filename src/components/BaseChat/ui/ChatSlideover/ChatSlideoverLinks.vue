<template>
	<BaseEmpty
		v-if="links.length === 0"
		variant="ghost"
		icon="link"
		:title="UI_CHAT_TEXT.NO_LINKS"
		:size-scale="sizeScale"
		class="base-chat-slideover__empty" />
	<ul v-else class="base-chat-slideover__links-list">
		<li v-for="link in links" :key="link.url">
			<a :href="link.url" target="_blank" rel="noopener noreferrer" class="base-chat-slideover__link-item">
				<span class="base-chat-slideover__link-icon" aria-hidden="true">
					<BaseIcon name="link" :size-scale="sizeScale * CHAT_SCALE.SMALL" />
				</span>
				<span class="base-chat-slideover__link-info">
					<span class="base-chat-slideover__link-url">{{ link.url }}</span>
					<span class="base-chat-slideover__link-date">{{ link.publishedAt }}</span>
				</span>
			</a>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseEmpty } from '@components/BaseEmpty'
import { CHAT_SCALE } from '../../model/chatScale'
import type { ChatMessage } from '../../types/BaseChat.types'
import type { ChatSlideoverLinksProps, SharedLink } from '../../types/ChatSlideoverLinks.types'

const props = defineProps<ChatSlideoverLinksProps>()

function getPublishedLabel(message: ChatMessage): string {
	return message.date || message.time
}

const links = computed((): SharedLink[] => {
	const result: SharedLink[] = []
	const seen = new Set<string>()
	const urlRegex = /(https?:\/\/[^\s]+)/gi
	for (const message of props.messages) {
		if (!message.text) continue
		for (const url of message.text.match(urlRegex) ?? []) {
			if (seen.has(url)) continue
			seen.add(url)
			result.push({ url, publishedAt: getPublishedLabel(message) })
		}
	}
	return result
})
</script>
