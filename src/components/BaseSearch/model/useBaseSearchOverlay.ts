/** Composable: логика BaseSearchOverlay — поиск в окне или боковой панели: открытие, закрытие, фокус и классы слоя */
import { computed, nextTick, ref } from 'vue'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useLayerIndex } from '@composables/useLayerStack'
import { useScrollLock } from '@composables/useScrollLock'
import type BaseSearchInput from '../ui/BaseSearchInput.vue'
import { useTeleportTarget } from '@composables/useTeleportTarget'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseSearchOverlayExpose, BaseSearchOverlayProps } from '../types/BaseSearchOverlay.types'

/** Классы слоя по виду панели (modal или sidebar): свои и из customClass */
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
	// Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo)
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
