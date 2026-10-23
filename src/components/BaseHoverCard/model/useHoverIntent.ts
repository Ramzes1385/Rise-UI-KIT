import { onBeforeUnmount } from 'vue'
import type { HoverIntent, HoverIntentOptions } from '../types/BaseHoverCard.types'

export function useHoverIntent(options: HoverIntentOptions): HoverIntent & { cancel: () => void } {
	let timer: ReturnType<typeof setTimeout> | undefined
	let pointerType = 'mouse'

	function cancel(): void {
		clearTimeout(timer)
		timer = undefined
	}

	function apply(value: boolean, isFocusLoss: boolean): void {
		const isFocusStillInside = isFocusLoss && !value && options.isWithinCard(document.activeElement)
		if (!isFocusStillInside) options.setOpen(value)
	}

	function schedule(value: boolean, delay: number, isFocusLoss = false): void {
		cancel()
		if (value && options.isDisabled()) return
		if (delay <= 0) apply(value, isFocusLoss)
		else timer = setTimeout(() => apply(value, isFocusLoss), delay)
	}

	onBeforeUnmount(cancel)

	return {
		cancel,
		handlePointerdown(event) {
			pointerType = event.pointerType
		},
		handlePointerenter(event) {
			if (event.pointerType !== 'touch') schedule(true, options.openDelay())
		},
		handlePointerleave(event) {
			if (event.pointerType !== 'touch') schedule(false, options.closeDelay())
		},
		handleKeydown() {
			pointerType = 'mouse'
		},
		handleClick() {
			if (pointerType === 'touch') schedule(!options.isOpen(), 0)
		},
		handleFocusin() {
			if (pointerType !== 'touch') schedule(true, 0)
		},
		handleFocusout(event) {
			pointerType = 'mouse'
			if (!options.isWithinCard(event.relatedTarget)) schedule(false, options.closeDelay(), true)
		},
		hold: cancel,
		release(event) {
			const isTouch = event instanceof PointerEvent && event.pointerType === 'touch'
			const isToCard = event instanceof FocusEvent && options.isWithinCard(event.relatedTarget)
			if (!isTouch && !isToCard) schedule(false, options.closeDelay(), event instanceof FocusEvent)
		},
	}
}
