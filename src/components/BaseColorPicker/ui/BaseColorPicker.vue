<template>
	<BasePopover
		v-model:is-open="isOpen"
		:position="position"
		:size-scale="sizeScale"
		:custom-class="{ root: classes.root }"
		class="base-color-picker">
		<template #trigger>
			<button
				ref="swatchRef"
				type="button"
				class="base-color-picker__swatch"
				:class="classes.swatch"
				:style="hasTransparentSwatch ? undefined : { backgroundColor: swatchColor }"
				:disabled="isDisabled"
				:aria-label="`${UI_COLOR_PICKER.SELECTED_COLOR} ${swatchColor}`">
				<slot name="trigger" />
			</button>
		</template>

		<div class="base-color-picker__panel" :class="classes.panel">
			<div
				ref="areaRef"
				class="base-color-picker__area"
				:style="{ backgroundColor: picker.hueColor.value }"
				role="slider"
				:aria-label="UI_COLOR_PICKER.SATURATION_BRIGHTNESS"
				:aria-valuetext="picker.hex.value"
				@pointerdown="handleAreaPointerDown">
				<span class="base-color-picker__marker" :style="picker.markerStyle.value" />
			</div>

			<input
				class="base-color-picker__hue"
				type="range"
				min="0"
				max="360"
				:aria-label="UI_COLOR_PICKER.HUE"
				:value="picker.hsv.value.h"
				@input="handleHueInput" />

			<input
				v-if="!isHexHidden"
				class="base-color-picker__hex"
				type="text"
				:aria-label="UI_COLOR_PICKER.HEX_VALUE"
				:value="swatchColor"
				@change="handleHexChange" />

			<div v-if="!isPresetsHidden" class="base-color-picker__presets">
				<button
					v-for="preset in presets"
					:key="preset"
					type="button"
					class="base-color-picker__preset"
					:style="{ backgroundColor: preset }"
					:aria-label="`${UI_COLOR_PICKER.PRESET} ${preset}`"
					@click="handlePresetClick(preset)" />
			</div>

			<button
				v-if="isResettable"
				type="button"
				class="base-color-picker__reset"
				:class="classes.reset"
				@click="handleReset">
				{{ resetLabel }}
			</button>
		</div>
	</BasePopover>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { BasePopover } from '@components/BasePopover'
import { useColorPicker } from '@composables/useColorPicker'
import { useCustomClass } from '@composables/useCustomClass'
import { useFormField, type FormFieldExpose } from '@composables/useFormField'
import { UI_COLOR_PICKER, UI_TEXT, SIZE_SCALE_DEFAULT} from '@constants'
import { normalizeHex } from '@utils/colorUtils'
import { toHTMLInputElement } from '@utils/domUtils'
import '../styles/BaseColorPicker.style.scss'
import { DEFAULT_COLOR_PRESETS } from '../model/BaseColorPicker.types'
import type { BaseColorPickerEmits, BaseColorPickerProps, BaseColorPickerSlots } from '../model/BaseColorPicker.types'

const props = withDefaults(defineProps<BaseColorPickerProps>(), {
	position: 'bottom',
	isHexHidden: false,
	isPresetsHidden: false,
	isResettable: false,
	resetLabel: UI_TEXT.NO_COLOR,
	hasTransparentSwatch: false,
	isDisabled: false,
	sizeScale: SIZE_SCALE_DEFAULT,
	presets: () => DEFAULT_COLOR_PRESETS,
})

const emit = defineEmits<BaseColorPickerEmits>()
defineSlots<BaseColorPickerSlots>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'swatch', 'panel', 'preset', 'reset'],
})

const swatchRef = ref<HTMLElement | null>(null)
const areaRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
let stopAreaDrag: (() => void) | null = null

const formField = useFormField({
	value: () => props.modelValue,
})

const picker = useColorPicker({
	getValue: () => props.modelValue,
	onChange: hex => {
		emit('update:modelValue', hex)
		emit('change', hex)
	},
})

/** Цвет swatch и поля HEX — нормализованное значение модели (источник истины) */
const swatchColor = computed(() => normalizeHex(props.modelValue) ?? picker.hex.value)

/** Установить saturation/value по координатам указателя в области */
function applyAreaPoint(clientX: number, clientY: number): void {
	const area = areaRef.value
	/* istanbul ignore next -- defensive: pointerdown невозможен без смонтированного areaRef */
	if (!area) return
	const rect = area.getBoundingClientRect()
	picker.setSaturationValue({
		x: (clientX - rect.left) / rect.width,
		y: (clientY - rect.top) / rect.height,
	})
}

/** Начало выбора в SV-области с захватом перемещения */
function handleAreaPointerDown(event: PointerEvent): void {
	applyAreaPoint(event.clientX, event.clientY)
	const handlePointerMove = (moveEvent: PointerEvent): void => applyAreaPoint(moveEvent.clientX, moveEvent.clientY)
	const handlePointerUp = (): void => stopAreaDrag?.()
	stopAreaDrag = (): void => {
		window.removeEventListener('pointermove', handlePointerMove)
		window.removeEventListener('pointerup', handlePointerUp)
		stopAreaDrag = null
	}
	window.addEventListener('pointermove', handlePointerMove)
	window.addEventListener('pointerup', handlePointerUp)
}

onBeforeUnmount(() => stopAreaDrag?.())

/** Изменение тона через слайдер */
function handleHueInput(event: Event): void {
	const target = toHTMLInputElement(event.target)
	if (!target) return
	picker.setHue(Number(target.value))
}

/** Ручной ввод HEX */
function handleHexChange(event: Event): void {
	const target = toHTMLInputElement(event.target)
	if (!target) return
	picker.setHex(target.value)
}

/** Выбор цвета-пресета — выбор завершён, закрываем панель */
function handlePresetClick(preset: string): void {
	picker.setHex(preset)
	isOpen.value = false
}

/** Сброс цвета — закрываем панель */
function handleReset(): void {
	emit('reset')
	isOpen.value = false
}

defineExpose<FormFieldExpose>({
	rootRef: swatchRef,
	focus: () => swatchRef.value?.focus(),
	blur: () => swatchRef.value?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
