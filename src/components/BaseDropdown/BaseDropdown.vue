<template>
	<div ref="wrapperRef" class="base-dropdown" :class="classes.root">
		<slot />

		<Teleport to="body">
			<Transition name="dropdown">
				<div
					v-if="isOpen"
					ref="dropdownRef"
					class="base-dropdown__panel"
					:class="[panelClass, variantClass, classes.panel]"
					:style="[panelStyle, paddingStyle, sizeScaleStyle, variantStyle, customColorStyle]"
					@mousedown="handlePanelMousedown"
					@focusin="handlePanelFocusin">
					<slot name="dropdown" />
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { useClickOutside } from '@composables/useClickOutside'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useDropdownPosition } from '@composables/useDropdownPosition'
import { useEscapeKey } from '@composables/useEscapeKey'
import { usePadding } from '@composables/usePadding'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed, getCurrentInstance, ref, watch } from 'vue'
import './BaseDropdown.style.scss'
import type { BaseDropdownEmits, BaseDropdownProps } from './BaseDropdown.types'

const props = defineProps<BaseDropdownProps>()
const rawProps = getCurrentInstance()?.vnode.props

const isOpen = computed(() => props.isOpen ?? false)
const position = computed(() => props.position ?? 'bottom-start')
const variant = computed(() => props.variant ?? 'default')
const gap = computed(() => props.gap ?? 4)
const maxHeight = computed(() => props.maxHeight ?? '320px')
const matchWidth = computed(() => props.matchWidth ?? false)
const closeOnEscape = computed(() =>
	rawProps && ('closeOnEscape' in rawProps || 'close-on-escape' in rawProps) ? (props.closeOnEscape ?? true) : true,
)
const preventMousedown = computed(() =>
	rawProps && ('preventMousedown' in rawProps || 'prevent-mousedown' in rawProps)
		? (props.preventMousedown ?? true)
		: true,
)
const panelClass = computed(() => props.panelClass ?? '')
const padding = computed(() => props.padding ?? 8)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({ block: 'base-dropdown__panel', getVariant: () => variant.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'panel'],
})
const { paddingStyle } = usePadding({ getPadding: () => padding.value, prefix: '--dd-pad', defaultPadding: 8 })

const emit = defineEmits<BaseDropdownEmits>()

const wrapperRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

/** Элемент с фокусом до открытия панели */
const savedActiveElement = ref<HTMLElement | null>(null)

/** Сохранение активного элемента при открытии */
watch(
	() => isOpen.value,
	value => {
		if (value) {
			savedActiveElement.value = document.activeElement as HTMLElement
		} else {
			savedActiveElement.value = null
		}
	},
)

/** Позиционирование выпадающей панели */
const { panelStyle, updatePosition } = useDropdownPosition({
	wrapperRef,
	dropdownRef,
	position: () => position.value,
	gap: () => gap.value,
	matchWidth: () => matchWidth.value,
	maxHeight: () => maxHeight.value,
	isOpen: () => isOpen.value,
})

/** Закрытие дропдауна: эмитит update:isOpen и close */
function handleClose(): void {
	emit('update:isOpen', false)
	emit('close')
}

/** Закрытие по клику снаружи */
useClickOutside({
	targets: [wrapperRef, dropdownRef],
	callback: handleClose,
	isActive: () => isOpen.value,
})

/** Закрытие по Escape */
useEscapeKey({
	isActive: () => isOpen.value && closeOnEscape.value,
	callback: handleClose,
})

/** Предотвратить mousedown внутри панели */
function handlePanelMousedown(event: MouseEvent): void {
	if (preventMousedown.value) {
		event.preventDefault()
	}
}

/** Вернуть фокус на триггер при фокусе внутри панели */
function handlePanelFocusin(): void {
	if (preventMousedown.value && savedActiveElement.value) {
		savedActiveElement.value.focus()
	}
}

defineExpose({ updatePosition })
</script>
