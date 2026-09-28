<template>
	<div ref="wrapperRef" class="base-dropdown" :class="classes.root">
		<slot />

		<Teleport defer :to="teleportTarget">
			<Transition name="base-dropdown">
				<div
					v-if="isOpen"
					ref="dropdownRef"
					class="base-dropdown__panel"
					:class="[panelClass, variantClass, classes.panel]"
					:style="[panelStyle, paddingStyle, sizeScaleStyle, variantStyle, customColorStyle, layerStyle]"
					:data-theme="inheritedTheme"
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
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import { useClickOutside } from '@composables/useClickOutside'
import { kitDefaults } from '@composables/useDefaults'
import { useDropdownPosition } from '@composables/useDropdownPosition'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import { useLayerIndex } from '@composables/useLayerStack'
import { usePadding } from '@composables/usePadding'
import { useInheritedTheme, useTeleportTarget } from '@composables/useTeleportTarget'
import { getActiveElement } from '@utils/domUtils'
import '../styles/BaseDropdown.style.scss'
import type { BaseDropdownEmits, BaseDropdownProps, BaseDropdownSlots } from '../model/BaseDropdown.types'

/** Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo) */
const teleportTarget = useTeleportTarget()

const props = withDefaults(
	defineProps<BaseDropdownProps>(),
	kitDefaults('BaseDropdown', {
		variant: DEFAULT_VARIANT,
		isOpen: false,
		position: 'bottom-start',
		gap: 4,
		maxHeight: '320px',
		matchWidth: false,
		panelClass: '',
		padding: undefined,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const { wasPropPassed } = useExplicitPropDetection()

const closeOnEscape = computed(() =>
	wasPropPassed('closeOnEscape') || wasPropPassed('close-on-escape') ? (props.closeOnEscape ?? true) : true,
)
const preventMousedown = computed(() =>
	wasPropPassed('preventMousedown') || wasPropPassed('prevent-mousedown') ? (props.preventMousedown ?? true) : true,
)
const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-dropdown__panel', props, [
	'root',
	'panel',
])
const { paddingStyle: explicitPaddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--dd-pad' })
/** Без пропа padding отступ панели берётся из стилей (4px со всех сторон), inline-переменные не пишутся. */
const paddingStyle = computed(() => (props.padding === undefined ? undefined : explicitPaddingStyle.value))

const emit = defineEmits<BaseDropdownEmits>()
defineSlots<BaseDropdownSlots>()

const wrapperRef = ref<HTMLElement | null>(null)
/** Тема блока, в котором стоит триггер: панель в body иначе взяла бы тему страницы */
const inheritedTheme = useInheritedTheme(
	() => wrapperRef.value,
	() => props.isOpen,
)
/** Место панели среди открытых слоёв: список в окне — над окном, окно из поповера — над поповером */
const layerStyle = useLayerIndex(() => props.isOpen)
const dropdownRef = ref<HTMLElement | null>(null)

/** Элемент с фокусом до открытия панели */
const savedActiveElement = ref<HTMLElement | null>(null)

/**
 * Панель закрывается, пока фокус внутри неё (например, в поле поиска BaseSelect): после удаления панели
 * браузер сбросил бы фокус на body — возвращаем его на элемент, с которого панель открыли.
 * Вызывается до патча DOM (flush 'pre'), пока панель ещё отрендерена.
 */
function restoreFocusFromPanel(): void {
	const target = savedActiveElement.value
	const active = document.activeElement
	if (!target || target === document.body || !target.isConnected) return
	if (!active || !dropdownRef.value?.contains(active)) return
	target.focus()
}

/** Сохранение активного элемента при открытии и возврат фокуса при закрытии */
watch(
	() => props.isOpen,
	value => {
		if (value) {
			savedActiveElement.value = getActiveElement()
		} else {
			restoreFocusFromPanel()
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

/** Поля ввода внутри панели (например, поиск BaseSelect) должны получать фокус — иначе в них нельзя печатать */
const TEXT_ENTRY_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

/** Событие пришло из поля ввода панели */
function isTextEntryTarget(target: EventTarget | null): boolean {
	return target instanceof Element && target.closest(TEXT_ENTRY_SELECTOR) !== null
}

/** Предотвратить mousedown внутри панели (фокус остаётся на триггере), кроме полей ввода */
function handlePanelMousedown(event: MouseEvent): void {
	if (preventMousedown.value && !isTextEntryTarget(event.target)) {
		event.preventDefault()
	}
}

/** Вернуть фокус на триггер при фокусе внутри панели, кроме полей ввода */
function handlePanelFocusin(event: FocusEvent): void {
	if (preventMousedown.value && savedActiveElement.value && !isTextEntryTarget(event.target)) {
		savedActiveElement.value.focus()
	}
}

defineExpose({ updatePosition })
</script>
