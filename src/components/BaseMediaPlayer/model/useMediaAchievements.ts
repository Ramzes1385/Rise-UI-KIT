import { isSafeUrl } from '@utils/urlUtils'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { MediaAchievement, MediaAchievementsOptions } from '../types/MediaNotices.types'

const STORAGE_KEY = 'rise-media:achievements'

const TOAST_DURATION = 5000

const ICON_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

function readEarned(): string[] {
	try {
		const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
		return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : []
	} catch {
		return []
	}
}

function writeEarned(ids: string[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
	} catch {
		return
	}
}

function useToasts() {
	const queue = ref<MediaAchievement[]>([])
	let timer: ReturnType<typeof setTimeout> | undefined
	const dismiss = (): void => {
		clearTimeout(timer)
		queue.value = queue.value.slice(1)
		if (queue.value.length > 0) timer = setTimeout(dismiss, TOAST_DURATION)
	}
	onBeforeUnmount(() => clearTimeout(timer))
	return {
		current: computed(() => queue.value[0] ?? null),
		dismiss,
		push(achievement: MediaAchievement): void {
			queue.value = [...queue.value, achievement]
			if (queue.value.length === 1) timer = setTimeout(dismiss, TOAST_DURATION)
		},
	}
}

export function useMediaAchievements(options: MediaAchievementsOptions) {
	const local = ref<string[]>(typeof window === 'undefined' ? [] : readEarned())
	const earned = computed(() => new Set([...(options.earned() ?? []), ...local.value]))
	const toasts = useToasts()
	const award = (id: string): void => {
		const achievement = (options.achievements() ?? []).find(item => item.id === id)
		if (!achievement || earned.value.has(id)) return
		local.value = [...local.value, id]
		writeEarned(local.value)
		toasts.push(achievement)
		options.emitAchievement(achievement)
	}
	watch(
		() => options.state.currentTime,
		time => {
			if (options.state.isPaused || options.state.isSeeking) return
			for (const item of options.achievements() ?? []) if (typeof item.at === 'number' && item.at <= time) award(item.id)
		},
	)
	watch(
		() => options.state.isEnded,
		isEnded => isEnded && (options.achievements() ?? []).filter(item => item.at === 'end').forEach(item => award(item.id)),
	)

	return {
		achievementToast: toasts.current,
		achievementIcon: computed(() => {
			const icon = toasts.current.value?.icon
			return icon && isSafeUrl(icon, ICON_PROTOCOLS) ? icon : undefined
		}),
		dismissAchievement: toasts.dismiss,
		awardAchievement: award,
	}
}
