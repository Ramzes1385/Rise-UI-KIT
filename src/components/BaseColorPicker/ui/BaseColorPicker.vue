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
				:aria-expanded="isOpen ? 'true' : 'false'"
				:aria-label="`${UI_COLOR_PICKER.SELECTED_COLOR} ${swatchColor}`">
				<slot name="trigger" />
			</button>
		</template>

		<div class="base-color-picker__panel" :class="classes.panel">
			<!-- Область насыщенности (по горизонтали) и яркости (по вертикали): мышью и стрелками, Shift — шаг 10 -->
			<div
				ref="areaRef"
				class="base-color-picker__area"
				:style="{ backgroundColor: picker.hueColor.value }"
				role="slider"
				tabindex="0"
				:aria-label="UI_COLOR_PICKER.SATURATION_BRIGHTNESS"
				aria-valuemin="0"
				aria-valuemax="100"
				:aria-valuenow="picker.hsv.value.s"
				:aria-valuetext="picker.hex.value"
				@pointerdown="handleAreaPointerDown"
				@keydown="handleAreaKeydown">
				<span class="base-color-picker__marker" :style="[picker.markerStyle.value, { backgroundColor: picker.hex.value }]" />
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
				spellcheck="false"
				autocomplete="off"
				:aria-label="UI_COLOR_PICKER.HEX_VALUE"
				:value="swatchColor"
				@change="handleHexChange" />

			<div v-if="!isPresetsHidden" class="base-color-picker__presets">
				<button
					v-for="preset in presets"
					:key="preset"
					type="button"
					class="base-color-picker__preset"
					:class="[{ 'base-color-picker__preset--selected': isPresetSelected(preset) }, classes.preset]"
					:style="{ backgroundColor: preset }"
					:aria-label="`${UI_COLOR_PICKER.PRESET} ${preset}`"
					:aria-pressed="isPresetSelected(preset) ? 'true' : 'false'"
					@click="handlePresetClick(preset)" />
			</div>

			<button v-if="isResettable" type="button" class="base-color-picker__reset" :class="classes.reset" @click="handleReset">
				{{ resetLabel ?? UI_TEXT.NO_COLOR }}
			</button>
		</div>
	</BasePopover>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { normalizeHex } from '@utils/colorUtils'
import { toHTMLInputElement } from '@utils/domUtils'
import { BasePopover } from '@components/BasePopover'
import { kitDefaults } from '@composables/useDefaults'
import { useFormField } from '@composables/useFormField'
import { useColorPicker } from '@composables/useColorPicker'
import { useCustomClass } from '@composables/useCustomClass'
import { UI_COLOR_PICKER, UI_TEXT } from '@/locales/messages'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import '../styles/BaseColorPicker.style.scss'
import { DEFAULT_COLOR_PRESETS } from '../model/colorPresets'
import type { BaseColorPickerEmits, BaseColorPickerProps, BaseColorPickerSlots } from '../types/BaseColorPicker.types'

const props = withDefaults(
	defineProps<BaseColorPickerProps>(),
	kitDefaults('BaseColorPicker', {
		position: 'bottom',
		isHexHidden: false,
		isPresetsHidden: false,
		isResettable: false,
		hasTransparentSwatch: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
		presets: () => DEFAULT_COLOR_PRESETS,
	}),
)

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

/** Шаг стрелок в SV-области: 1% насыщенности или яркости, с Shift — 10% */
const AREA_STEP = 0.01
const AREA_STEP_LARGE = 0.1

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

/** Пресет совпадает с текущим цветом (сравнение нормализованных HEX: #FFF и #ffffff — один цвет) */
function isPresetSelected(preset: string): boolean {
	return normalizeHex(preset) === swatchColor.value
}

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

/** Стрелки в SV-области: влево/вправо — насыщенность, вверх/вниз — яркость; Shift — крупный шаг */
function handleAreaKeydown(event: KeyboardEvent): void {
	const step = event.shiftKey ? AREA_STEP_LARGE : AREA_STEP
	const offsets: Record<string, [number, number]> = {
		ArrowLeft: [-step, 0],
		ArrowRight: [step, 0],
		ArrowUp: [0, -step],
		ArrowDown: [0, step],
	}
	const offset = offsets[event.key]
	if (!offset) return
	event.preventDefault()
	const { s, v } = picker.hsv.value
	picker.setSaturationValue({ x: s / 100 + offset[0], y: 1 - v / 100 + offset[1] })
}

function handleHueInput(event: Event): void {
	const target = toHTMLInputElement(event.target)
	if (!target) return
	picker.setHue(Number(target.value))
}

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

defineExpose({
	rootRef: swatchRef,
	focus: () => swatchRef.value?.focus(),
	blur: () => swatchRef.value?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
