import { computed } from 'vue'
import { getLocale, pluralize } from '@/locales/state'
import type { BadgesProps } from '../types/ChatBadges.types'

export const CHAT_MAX_BADGES = 3

export function useChatBadges(props: BadgesProps) {
	const limit = computed(() => Math.max(0, props.max))
	const hiddenBadges = computed(() => props.badges.slice(limit.value))

	return {
		visibleBadges: computed(() => props.badges.slice(0, limit.value)),
		hiddenCount: computed(() => hiddenBadges.value.length),
		hiddenLabel: computed(() => {
			if (hiddenBadges.value.length === 0) return ''
			const count = pluralize(getLocale().plural.BADGES_MORE, hiddenBadges.value.length)
			return `${count}: ${hiddenBadges.value.map(badge => badge.label).join(', ')}`
		}),
	}
}
