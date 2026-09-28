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
import { BaseIcon } from '@components/BaseIcon'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { BaseEmpty } from '@components/BaseEmpty'
import { CHAT_SCALE } from '../../model/chatScale'
import { useChatSlideoverLinks } from '../../model/useChatSlideoverLinks'
import type { ChatSlideoverLinksProps } from '../../types/ChatSlideoverLinks.types'

const props = defineProps<ChatSlideoverLinksProps>()

const { links } = useChatSlideoverLinks(props)
</script>
