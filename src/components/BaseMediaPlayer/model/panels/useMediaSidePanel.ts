import { useMotion } from '@composables/app/useMotion'
import { usePlayerContext } from '../player/usePlayerContext'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { MediaSidePanelOptions } from '../../types/playback/MediaScreen.types'

function useOutsidePress(panel: Readonly<{ value: HTMLElement | null }>, options: MediaSidePanelOptions): void {
	const onPointerDown = (event: PointerEvent): void => {
		const target = event.target as Element
		if (!panel.value?.contains(target) && !target.closest?.(options.trigger)) options.close()
	}
	const stop = (): void => document.removeEventListener('pointerdown', onPointerDown, true)
	watch(options.isOpen, open => (open ? document.addEventListener('pointerdown', onPointerDown, true) : stop()))
	onBeforeUnmount(stop)
}

export function useMediaSidePanel(options: MediaSidePanelOptions) {
	const { rootRef } = usePlayerContext()
	const panelRef = ref<HTMLElement | null>(null)
	const motion = useMotion(rootRef)
	const leave = (action: () => void): void => {
		const hadFocus = panelRef.value?.contains(document.activeElement)
		action()
		if (hadFocus) rootRef.value?.querySelector<HTMLElement>(options.trigger)?.focus()
	}
	watch(options.isOpen, isOpen => {
		if (!isOpen) return
		void nextTick(() => {
			const panel = panelRef.value
			options.focus
				.map(selector => panel?.querySelector<HTMLElement>(selector))
				.find(Boolean)
				?.focus()
		})
	})
	useOutsidePress(panelRef, options)

	return {
		panelRef,
		leave,
		transitionDuration: computed(() => ({ enter: motion.duration('slow') * 2.4, leave: motion.duration('base') * 1.2 })),
		close: (): void => leave(options.close),
		onKeydown(event: KeyboardEvent): void {
			if (event.key !== 'Escape') return
			event.stopPropagation()
			leave(options.close)
		},
	}
}
