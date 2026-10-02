import { fraction } from '../playback/timeline'
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import { UI_PRESENTATION, formatMessage } from '../player/messages'
import type { PresentationLockSource } from '../../types/PresentationModel.types'

const FLASH_MS = 4000

function useFlash(index: () => number) {
	const flash = ref('')
	let timer: ReturnType<typeof setTimeout> | undefined
	const clear = (): void => {
		clearTimeout(timer)
		flash.value = ''
	}
	watch(index, clear)
	onBeforeUnmount(clear)
	return {
		flash,
		show(text: string): void {
			clear()
			flash.value = text
			timer = setTimeout(clear, FLASH_MS)
		},
	}
}

export function usePresentationLock(source: PresentationLockSource) {
	const { flash, show } = useFlash(source.index)
	const mediaLeft = computed(() => {
		if (source.isMediaDone()) return 0
		const duration = source.slideDuration()
		return Number.isFinite(duration) ? Math.max(0, (duration - source.slideTime()) / source.rate()) : Number.NaN
	})
	const remaining = computed(() => Math.max(mediaLeft.value, source.minDuration() - source.watched(), 0))
	const lockText = computed(() =>
		Number.isNaN(remaining.value)
			? UI_PRESENTATION.LOCKED_AUDIO
			: formatMessage(UI_PRESENTATION.LOCKED, { n: Math.ceil(remaining.value) }),
	)
	const isNextLocked = computed(() => source.index() < source.count() - 1 && !source.canGoTo(source.index() + 1))

	return {
		flash,
		isNextLocked,
		lockText,
		lockHintId: `presentation-lock-${useId()}`,
		lockPercent: computed(() => {
			const media = source.isMediaDone() ? 1 : fraction(source.slideTime(), source.slideDuration())
			const watched = source.minDuration() > 0 ? Math.min(1, source.watched() / source.minDuration()) : 1
			return Math.round(Math.min(media, watched) * 100)
		}),
		next(): void {
			if (!source.next()) show(lockText.value)
		},
	}
}
