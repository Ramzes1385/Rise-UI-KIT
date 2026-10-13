import { UI_ARIA } from '@/locales/messages'
import { useSearchMotion } from './useSearchMotion'
import type BaseSearchInput from '../ui/BaseSearchInput.vue'
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseSearchOverlayExpose, BaseSearchOverlayProps } from '../types/BaseSearchOverlay.types'

const FOCUS_RETURN_MS = 600

function joinClasses(...classes: (string | undefined)[]): string {
	return classes.filter(Boolean).join(' ')
}

function useLayerClasses(props: BaseSearchOverlayProps) {
	const prefix = computed(() => props.panel)
	const overlayClass = computed(() => joinClasses(props.ui(`${prefix.value}-overlay`), props.classes[`${prefix.value}Overlay`]))
	const panelClass = computed(() => joinClasses(props.ui(prefix.value), props.classes[prefix.value]))
	return {
		prefix,
		dialogProps: computed(() => ({
			ariaLabel: UI_ARIA.SEARCH,
			sizeScale: props.sizeScale,
			customClass: { root: overlayClass.value, [prefix.value === 'modal' ? 'content' : 'panel']: panelClass.value },
		})),
		headerClass: computed(() => [props.ui(`${prefix.value}-header`), props.classes[`${prefix.value}Header`]]),
		inputClass: computed(() => props.classes[`${prefix.value}Input`]),
		closeBtnClass: computed(() => props.ui(`${prefix.value}-close`)),
		closeBtnCustomClass: computed(() => props.classes[`${prefix.value}Close`]),
		closeIconCustomClass: computed(() => props.classes[`${prefix.value}CloseIcon`]),
		resultsClass: computed(() => [props.ui(`${prefix.value}-results`), props.classes[`${prefix.value}Results`]]),
	}
}

export function useBaseSearchOverlay(props: BaseSearchOverlayProps, emit: (event: 'close') => void) {
	const { sizeScaleStyle, variantClass, variantStyle, customColorStyle } = useStandardBaseComponent('base-search', props)
	const isOpen = ref(false)
	const rootRef = ref<HTMLElement | null>(null)
	const inputRef = ref<InstanceType<typeof BaseSearchInput> | null>(null)
	let isFocusReturning = false
	let returnTimer: ReturnType<typeof setTimeout> | undefined
	const endFocusReturn = (): void => {
		isFocusReturning = false
		clearTimeout(returnTimer)
	}
	const close = (): void => {
		isOpen.value = false
		isFocusReturning = true
		clearTimeout(returnTimer)
		returnTimer = setTimeout(endFocusReturn, FOCUS_RETURN_MS)
		emit('close')
	}
	const open = (): void => {
		if (props.isDisabled) return
		isOpen.value = true
		nextTick(() => {
			inputRef.value?.focus()
		})
	}
	const onTriggerFocus = (): void => {
		if (!isFocusReturning) return open()
		endFocusReturn()
	}
	onBeforeUnmount(endFocusReturn)

	return {
		sizeScaleStyle,
		variantClass,
		variantStyle,
		customColorStyle,
		isOpen,
		rootRef,
		...useSearchMotion(rootRef),
		inputRef,
		...useLayerClasses(props),
		open,
		close,
		onTriggerFocus,
		onDialogToggle: (value: boolean): void => {
			if (!value) close()
		},
		exposed: { focus: (): void => inputRef.value?.focus(), open, close } satisfies BaseSearchOverlayExpose,
	}
}
