import { computed } from 'vue'
import { collectAttachments } from './sharedContent'
import type { ChatSlideoverMediaProps } from '../types/ChatSlideoverMedia.types'

export function useChatSlideoverMedia(props: ChatSlideoverMediaProps) {
	const media = computed(() => collectAttachments(props.messages, 'image'))
	return { media, imageUrls: computed((): string[] => media.value.map(item => item.url)) }
}
