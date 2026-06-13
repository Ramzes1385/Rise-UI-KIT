<template>
	<BasePopover
		v-model:is-open="isOpen"
		:position="position"
		:size-scale="sizeScale"
		:custom-class="{ root: classes.root }"
		class="base-color-picker">
		<template #trigger>
			<button
				type="button"
				class="base-color-picker__swatch"
				:class="classes.swatch"
				:style="hasTransparentSwatch ? undefined : { backgroundColor: swatchColor }"
				:disabled="isDisabled"
				:aria-label="`Выбранный цвет ${swatchColor}`">
				<slot name="trigger" />
			</button>
		</template>

		<div class="base-color-picker__panel" :class="classes.panel">
			<div
				ref="areaRef"
				class="base-color-picker__area"
				:style="{ backgroundColor: picker.hueColor.value }"
				role="slider"
				aria-label="Насыщенность и яркость"
				:aria-valuetext="picker.hex.value"
				@pointerdown="handleAreaPointerDown">
				<span class="base-color-picker__marker" :style="picker.markerStyle.value" />
			</div>

			<input
				class="base-color-picker__hue"
				type="range"
				min="0"
				max="360"
				aria-label="Тон"
				:value="picker.hsv.value.h"
				@input="handleHueInput" />

			<input
				v-if="!isHexHidden"
				class="base-color-picker__hex"
				type="text"
				aria-label="HEX-значение"
				:value="swatchColor"
				@change="handleHexChange" />

			<div v-if="!isPresetsHidden" class="base-color-picker__presets">
				<button
					v-for="preset in resolvedPresets"
					:key="preset"
					type="button"
					class="base-color-picker__preset"
					:style="{ backgroundColor: preset }"
					:aria-label="`Пресет ${preset}`"
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
import { BasePopover } from '@components/BasePopover'
import { useColorPicker } from '@composables/useColorPicker'
import { useCustomClass } from '@composables/useCustomClass'
import { normalizeHex } from '@utils/colorUtils'
import { computed, onBeforeUnmount, ref } from 'vue'
import './BaseColorPicker.style.scss'
import { DEFAULT_COLOR_PRESETS } from './BaseColorPicker.types'
import type { BaseColorPickerEmits, BaseColorPickerProps, BaseColorPickerSlots } from './BaseColorPicker.types'

const props = defineProps<BaseColorPickerProps>()

const position = computed(() => props.position ?? 'bottom')
const isHexHidden = computed(() => props.isHexHidden ?? false)
const isPresetsHidden = computed(() => props.isPresetsHidden ?? false)
const isResettable = computed(() => props.isResettable ?? false)
const resetLabel = computed(() => props.resetLabel ?? 'Без цвета')
const hasTransparentSwatch = computed(() => props.hasTransparentSwatch ?? false)
const isDisabled = computed(() => props.isDisabled ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)

const emit = defineEmits<BaseColorPickerEmits>()
defineSlots<BaseColorPickerSlots>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'swatch', 'panel', 'preset', 'reset'],
})

const areaRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
let stopAreaDrag: (() => void) | null = null

const picker = useColorPicker({
	getValue: () => props.modelValue,
	onChange: hex => {
		emit('update:modelValue', hex)
		emit('change', hex)
	},
})

const resolvedPresets = computed(() => props.presets ?? DEFAULT_COLOR_PRESETS)

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
	const onMove = (moveEvent: PointerEvent): void => applyAreaPoint(moveEvent.clientX, moveEvent.clientY)
	const onUp = (): void => stopAreaDrag?.()
	stopAreaDrag = (): void => {
		window.removeEventListener('pointermove', onMove)
		window.removeEventListener('pointerup', onUp)
		stopAreaDrag = null
	}
	window.addEventListener('pointermove', onMove)
	window.addEventListener('pointerup', onUp)
}

onBeforeUnmount(() => stopAreaDrag?.())

/** Изменение тона через слайдер */
function handleHueInput(event: Event): void {
	picker.setHue(Number((event.target as HTMLInputElement).value))
}

/** Ручной ввод HEX */
function handleHexChange(event: Event): void {
	picker.setHex((event.target as HTMLInputElement).value)
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
</script>
