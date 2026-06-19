<template>
	<div v-if="links.length === 0" class="base-chat-slideover__empty">
		<BaseIcon name="link" :size-scale="sizeScale * UI_CHAT_SCALE.AVATAR_LARGE" class="base-chat-slideover__empty-icon" />
		<BaseText :size-scale="sizeScale * UI_CHAT_SCALE.MEMBER" class="base-chat-slideover__empty-text">{{ UI_CHAT_TEXT.NO_LINKS }}</BaseText>
	</div>
	<div v-else class="base-chat-slideover__links-list">
		<div
			v-for="(link, index) in links"
			:key="index"
			class="base-chat-slideover__link-item"
			@click="openLink(link.url)">
			<BaseIcon name="link" :size-scale="sizeScale * UI_SCALE.SMALL" class="base-chat-slideover__link-icon" />
			<div class="base-chat-slideover__link-info">
				<BaseText tag="span" :size-scale="sizeScale * UI_SCALE.AUTOCOMPLETE" class="base-chat-slideover__link-url">
					{{ link.url }}
				</BaseText>
				<BaseText tag="span" :size-scale="sizeScale * UI_CHAT_SCALE.META" class="base-chat-slideover__link-date">
					{{ link.publishedAt }}
				</BaseText>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import {
	UI_CHAT_SCALE,
	UI_CHAT_TEXT,
	UI_SCALE,
} from '@constants'
import type { ChatMessage } from '../../model/BaseChat.types'
import type { ChatSlideoverLinksProps } from '../../model/ChatSlideoverLinks.types'

interface SharedLink {
	url: string
	publishedAt: string
}

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

function openLink(url: string): void {
	window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
