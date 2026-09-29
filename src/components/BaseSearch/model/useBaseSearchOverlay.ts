import { computed, nextTick, ref } from 'vue'
import type BaseSearchInput from '../ui/BaseSearchInput.vue'
import { useLayerIndex } from '@composables/app/useLayerStack'
import { useEscapeKey } from '@composables/overlay/useEscapeKey'
import { useScrollLock } from '@composables/overlay/useScrollLock'
import { useTeleportTarget } from '@composables/app/useTeleportTarget'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseSearchOverlayExpose, BaseSearchOverlayProps } from '../types/BaseSearchOverlay.types'

function useLayerClasses(props: BaseSearchOverlayProps) {
	const prefix = computed(() => props.panel)
	return {
		prefix,
		overlayClass: computed(() => `base-search__${prefix.value}-overlay`),
		panelClass: computed(() => [`base-search__${prefix.value}`, props.classes[prefix.value]]),
		headerClass: computed(() => [`base-search__${prefix.value}-header`, props.classes[`${prefix.value}Header`]]),
		inputClass: computed(() => props.classes[`${prefix.value}Input`]),
		closeBtnClass: computed(() => `base-search__${prefix.value}-close`),
		closeBtnCustomClass: computed(() => props.classes[`${prefix.value}Close`]),
		closeIconCustomClass: computed(() => props.classes[`${prefix.value}CloseIcon`]),
		resultsClass: computed(() => [`base-search__${prefix.value}-results`, props.classes[`${prefix.value}Results`]]),
	}
}

export function useBaseSearchOverlay(props: BaseSearchOverlayProps, emit: (event: 'close') => void) {
	const teleportTarget = useTeleportTarget()
	const { sizeScaleStyle, variantClass, variantStyle, customColorStyle } = useStandardBaseComponent('base-search', props)
	const isOpen = ref(false)
	const layerStyle = useLayerIndex(() => isOpen.value)
	const inputRef = ref<InstanceType<typeof BaseSearchInput> | null>(null)
	const { lock, unlock } = useScrollLock()
	const close = (): void => {
		isOpen.value = false
		unlock()
		emit('close')
	}
	useEscapeKey({ isActive: () => isOpen.value, callback: () => close() })
	const open = (): void => {
		if (props.isDisabled) return
		isOpen.value = true
		lock()
		nextTick(() => {
			inputRef.value?.focus()
		})
	}

	return {
		teleportTarget,
		sizeScaleStyle,
		variantClass,
		variantStyle,
		customColorStyle,
		isOpen,
		layerStyle,
		inputRef,
		...useLayerClasses(props),
		open,
		close,
		exposed: { focus: (): void => inputRef.value?.focus(), open, close } satisfies BaseSearchOverlayExpose,
	}
}
