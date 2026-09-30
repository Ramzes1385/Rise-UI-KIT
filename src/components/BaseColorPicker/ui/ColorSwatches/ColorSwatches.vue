<template>
	<div class="base-color-picker__swatches" role="group" :aria-label="label ?? ariaLabel">
		<span v-if="label" class="base-color-picker__swatches-label" aria-hidden="true">{{ label }}</span>
		<div class="base-color-picker__presets">
			<button
				v-for="color in colors"
				:key="color"
				type="button"
				class="base-color-picker__preset"
				:class="[{ 'base-color-picker__preset--selected': isSelected(color) }, swatchClass]"
				:style="{ backgroundColor: color, '--picker-swatch-color': color }"
				:aria-label="`${UI_COLOR_PICKER.PRESET} ${color}`"
				:aria-pressed="isSelected(color) ? 'true' : 'false'"
				@click="emit('select', color)" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { UI_COLOR_PICKER } from '@/locales/messages'
import type { ColorSwatchesEmits, ColorSwatchesProps } from '../../types/BaseColorPicker.types'

defineProps<ColorSwatchesProps>()
const emit = defineEmits<ColorSwatchesEmits>()
</script>
