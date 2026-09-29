import { onBeforeUnmount, ref, watch } from 'vue'

export function useMediaPopover() {
	const rootRef = ref<HTMLElement | null>(null)
	const isOpen = ref(false)
	const close = (): void => {
		const root = rootRef.value
		if (isOpen.value && root?.contains(document.activeElement)) root.querySelector<HTMLElement>('button')?.focus()
		isOpen.value = false
	}
	const onPointerDown = (event: PointerEvent): void => {
		if (!rootRef.value?.contains(event.target as Node)) close()
	}
	const stop = (): void => document.removeEventListener('pointerdown', onPointerDown, true)
	watch(isOpen, open => (open ? document.addEventListener('pointerdown', onPointerDown, true) : stop()))
	onBeforeUnmount(stop)

	return {
		rootRef,
		isOpen,
		close,
		toggle(): void {
			if (isOpen.value) close()
			else isOpen.value = true
		},
		onKeydown(event: KeyboardEvent): void {
			if (event.key !== 'Escape' || !isOpen.value) return
			event.stopPropagation()
			close()
		},
		onFocusOut(event: FocusEvent): void {
			const next = event.relatedTarget as Node | null
			if (next && !rootRef.value?.contains(next)) isOpen.value = false
		},
	}
}
