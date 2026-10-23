<template>
	<div :class="ui('swatches')" role="group" :aria-label="label ?? ariaLabel">
		<span v-if="label" :class="ui('swatches-label')" aria-hidden="true">{{ label }}</span>
		<div :class="ui('presets')">
			<button
				v-for="color in colors"
				:key="color"
				type="button"
				:class="[ui('preset'), { 'base-color-picker__preset--selected': isSelected(color) }, swatchClass]"
				:style="{ backgroundColor: color, '--picker-swatch-color': color }"
				:aria-label="`${UI_COLOR_PICKER.PRESET} ${swatchName(color)}`"
				:aria-pressed="isSelected(color) ? 'true' : 'false'"
				@click="emit('select', color)" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { UI_COLOR_PICKER } from '@/locales/messages'
import { swatchName } from '../../model/colorPresets'
import type { ColorSwatchesEmits, ColorSwatchesProps } from '../../types/BaseColorPicker.types'

defineProps<ColorSwatchesProps>()
const emit = defineEmits<ColorSwatchesEmits>()
</script>
