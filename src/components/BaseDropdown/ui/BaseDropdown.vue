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
import { computed, ref, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useClickOutside } from '@composables/useClickOutside'
import { useDropdownPosition } from '@composables/useDropdownPosition'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import { usePadding } from '@composables/usePadding'
import { UI_SIZE, SIZE_SCALE_DEFAULT} from '@constants'
import { getActiveElement } from '@utils/domUtils'
import '../styles/BaseDropdown.style.scss'
import type { BaseDropdownEmits, BaseDropdownProps, BaseDropdownSlots } from '../model/BaseDropdown.types'

const props = withDefaults(defineProps<BaseDropdownProps>(), {
	isOpen: false,
	position: 'bottom-start',
	gap: UI_SIZE.GAP.SM,
	maxHeight: UI_SIZE.PANEL_MAX_HEIGHT,
	matchWidth: false,
	panelClass: '',
	padding: 8,
	sizeScale: SIZE_SCALE_DEFAULT,
})
const { wasPropPassed } = useExplicitPropDetection()

const closeOnEscape = computed(() =>
	wasPropPassed('closeOnEscape') || wasPropPassed('close-on-escape') ? (props.closeOnEscape ?? true) : true,
)
const preventMousedown = computed(() =>
	wasPropPassed('preventMousedown') || wasPropPassed('prevent-mousedown')
		? (props.preventMousedown ?? true)
		: true,
)
const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-dropdown__panel', props, ['root', 'panel'])
const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--dd-pad', defaultPadding: UI_SIZE.PADDING.SM })

const emit = defineEmits<BaseDropdownEmits>()
defineSlots<BaseDropdownSlots>()

const wrapperRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

/** Элемент с фокусом до открытия панели */
const savedActiveElement = ref<HTMLElement | null>(null)

/** Сохранение активного элемента при открытии */
watch(
	() => props.isOpen,
	value => {
		if (value) {
			savedActiveElement.value = getActiveElement()
		} else {
			savedActiveElement.value = null
		}
	},
)

/** Позиционирование выпадающей панели */
const { panelStyle, updatePosition } = useDropdownPosition({
	wrapperRef,
	dropdownRef,
	position: () => props.position,
	gap: () => props.gap,
	matchWidth: () => props.matchWidth,
	maxHeight: () => props.maxHeight,
	isOpen: () => props.isOpen,
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
	isActive: () => props.isOpen,
})

/** Закрытие по Escape */
useEscapeKey({
	isActive: () => props.isOpen && closeOnEscape.value,
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
