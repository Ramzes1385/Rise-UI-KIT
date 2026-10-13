import { useMotion } from '@composables/app/useMotion'
import { shallowRef, watch, type ComputedRef } from 'vue'
import type { CommandGroupView } from '../types/BaseCommandPalette.types'

export function useResultsMotion(groups: ComputedRef<CommandGroupView[]>) {
	const anchorRef = shallowRef<HTMLElement | null>(null)
	const motion = useMotion(anchorRef)
	let before = 0
	let running: Animation | undefined
	const body = (): HTMLElement | null | undefined => anchorRef.value?.parentElement

	watch(
		groups,
		() => {
			before = body()?.offsetHeight ?? 0
			running?.cancel()
		},
		{ flush: 'pre' },
	)
	watch(
		groups,
		() => {
			const element = body()
			const after = element?.offsetHeight ?? 0
			if (!element?.animate || motion.isReduced.value || !before || before === after) return
			const frame = { overflow: 'hidden' }
			running = element.animate(
				[
					{ ...frame, height: `${before}px` },
					{ ...frame, height: `${after}px` },
				],
				{
					duration: motion.duration('base'),
					easing: motion.easing('emphasized'),
				},
			)
		},
		{ flush: 'post' },
	)
	return { anchorRef }
}
