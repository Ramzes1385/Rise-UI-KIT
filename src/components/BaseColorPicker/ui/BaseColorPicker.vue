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
import '../styles/BaseColorPicker.style.scss'
import { BasePopover } from '@components/BasePopover'
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_COLOR_PRESETS } from '../model/colorPresets'
import { UI_COLOR_PICKER, UI_TEXT } from '@/locales/messages'
import { useBaseColorPicker } from '../model/useBaseColorPicker'
import { SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
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

const {
	classes,
	swatchRef,
	isOpen,
	picker,
	swatchColor,
	areaRef,
	handleAreaPointerDown,
	handleAreaKeydown,
	isPresetSelected,
	handleHueInput,
	handleHexChange,
	handlePresetClick,
	handleReset,
	exposed,
} = useBaseColorPicker(props, emit)

defineExpose(exposed)
</script>
