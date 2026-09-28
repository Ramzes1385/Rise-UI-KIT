/** Composable: логика ChatSlideoverLinks — ссылки из сообщений чата для вкладки «Ссылки» */
import { computed } from 'vue'
import { collectLinks } from './sharedContent'
import type { ChatSlideoverLinksProps } from '../types/ChatSlideoverLinks.types'

export function useChatSlideoverLinks(props: ChatSlideoverLinksProps) {
	return { links: computed(() => collectLinks(props.messages)) }
}
