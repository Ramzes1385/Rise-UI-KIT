import { formatMessage } from '@/locales/state'
import { UI_IMAGE_COMPARE } from '@/locales/messages'
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseImageCompareEmits, BaseImageCompareProps } from '../types/BaseImageCompare.types'

const clamp = (value: number): number => Math.min(100, Math.max(0, Math.round(value * 10) / 10))

const KEY_STEPS: Record<string, (value: number, isLarge: boolean) => number> = {
	ArrowLeft: (value, isLarge) => value - (isLarge ? 10 : 1),
	ArrowDown: (value, isLarge) => value - (isLarge ? 10 : 1),
	ArrowRight: (value, isLarge) => value + (isLarge ? 10 : 1),
	ArrowUp: (value, isLarge) => value + (isLarge ? 10 : 1),
	PageDown: value => value - 10,
	PageUp: value => value + 10,
	Home: () => 0,
	End: () => 100,
}

function usePosition(props: BaseImageCompareProps, emit: BaseImageCompareEmits) {
	const position = shallowRef(clamp(props.position ?? 50))
	watch(
		() => props.position,
		value => {
			position.value = clamp(value ?? 50)
		},
	)
	const setPosition = (value: number): void => {
		const next = clamp(value)
		if (next === position.value) return
		position.value = next
		emit('update:position', next)
	}
	return { position, setPosition }
}

export function useBaseImageCompare(props: BaseImageCompareProps, emit: BaseImageCompareEmits) {
	const { position, setPosition } = usePosition(props, emit)
	const rootRef = ref<HTMLElement | null>(null)
	const isDragging = ref(false)
	const moveTo = (clientX: number): void => {
		const rect = (rootRef.value as HTMLElement).getBoundingClientRect()
		if (rect.width) setPosition(((clientX - rect.left) / rect.width) * 100)
	}
	const handleMove = (event: PointerEvent): void => moveTo(event.clientX)
	const stop = (): void => {
		isDragging.value = false
		window.removeEventListener('pointermove', handleMove)
		window.removeEventListener('pointerup', stop)
	}
	onBeforeUnmount(stop)
	return {
		...useStandardBaseComponent('base-image-compare', props, ['root', 'handle']),
		rootRef,
		position,
		isDragging,
		beforeText: computed(() => props.beforeLabel ?? UI_IMAGE_COMPARE.BEFORE),
		afterText: computed(() => props.afterLabel ?? UI_IMAGE_COMPARE.AFTER),
		handleLabel: computed(() =>
			formatMessage(UI_IMAGE_COMPARE.HANDLE, {
				before: props.beforeLabel ?? UI_IMAGE_COMPARE.BEFORE,
				after: props.afterLabel ?? UI_IMAGE_COMPARE.AFTER,
			}),
		),
		handlePointerDown(event: PointerEvent): void {
			if (event.button !== 0) return
			event.preventDefault()
			isDragging.value = true
			moveTo(event.clientX)
			window.addEventListener('pointermove', handleMove)
			window.addEventListener('pointerup', stop)
		},
		handleKeydown(event: KeyboardEvent): void {
			const step = KEY_STEPS[event.key]
			if (!step) return
			event.preventDefault()
			setPosition(step(position.value, event.shiftKey))
		},
	}
}
