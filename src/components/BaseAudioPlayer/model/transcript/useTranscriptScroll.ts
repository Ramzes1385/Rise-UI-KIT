import { computed, nextTick, ref, watch } from 'vue'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import type { AudioTranscriptScrollSource } from '../../types/AudioTranscript.types'

const STEPS: Record<string, (position: number, last: number) => number> = {
	ArrowDown: (position, last) => Math.min(position + 1, last),
	ArrowUp: position => Math.max(position - 1, 0),
	Home: () => 0,
	End: (_, last) => last,
}

function cueButton(list: HTMLElement | null, index: number): HTMLElement | null {
	return list?.querySelector<HTMLElement>(`[data-cue-index="${index}"]`) ?? null
}

export function useTranscriptScroll(source: AudioTranscriptScrollSource) {
	const listRef = ref<HTMLElement | null>(null)
	const focused = ref(-1)
	const isFollowPaused = ref(false)
	const isReduced = useReducedMotion()
	const scrollToCue = (index: number, behavior: 'auto' | 'smooth'): void => {
		const list = listRef.value
		const item = cueButton(list, index)
		if (!list || !item) return
		list.scrollTo?.({ top: Math.max(item.offsetTop - (list.clientHeight - item.offsetHeight) / 2, 0), behavior })
	}
	const follow = (behavior: 'auto' | 'smooth'): void => {
		if (source.isOpen() && !isFollowPaused.value) void nextTick(() => scrollToCue(source.current(), behavior))
	}
	watch(source.current, () => follow(isReduced.value ? 'auto' : 'smooth'))
	watch(source.isOpen, () => follow('auto'))
	const rovingIndex = computed(() => {
		const indexes = source.items().map(item => item.index)
		return [focused.value, source.current()].find(index => indexes.includes(index)) ?? indexes[0] ?? -1
	})
	return {
		listRef,
		rovingIndex,
		isFollowPaused,
		followCurrent(): void {
			isFollowPaused.value = false
			follow(isReduced.value ? 'auto' : 'smooth')
		},
		pauseFollow(): void {
			isFollowPaused.value = true
		},
		onCueFocus(index: number): void {
			focused.value = index
		},
		onListKeydown(event: KeyboardEvent): void {
			const step = STEPS[event.key]
			const indexes = source.items().map(item => item.index)
			const position = indexes.indexOf(Number((event.target as HTMLElement).dataset.cueIndex))
			if (!step || position === -1) return
			event.preventDefault()
			isFollowPaused.value = true
			cueButton(listRef.value, indexes[step(position, indexes.length - 1)])?.focus()
		},
	}
}
