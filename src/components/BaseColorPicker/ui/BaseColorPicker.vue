<template>
	<BasePopover
		v-model:is-open="isOpen"
		:position="position"
		max-height="calc(100vh - 16px)"
		:size-scale="sizeScale"
		:custom-class="{ root: classes.root }"
		class="base-color-picker">
		<template #trigger>
			<button
				ref="swatchRef"
				type="button"
				class="base-color-picker__swatch"
				:class="[{ 'base-color-picker__swatch--translucent': !hasTransparentSwatch && alphaPercent < 100 }, classes.swatch]"
				:style="hasTransparentSwatch ? undefined : { backgroundColor: swatchColor, '--picker-swatch-color': swatchColor }"
				:disabled="isDisabled"
				:aria-expanded="isOpen ? 'true' : 'false'"
				:aria-label="`${UI_COLOR_PICKER.SELECTED_COLOR} ${picker.value.value}`">
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

			<div class="base-color-picker__controls">
				<BaseTooltip
					v-if="isEyeDropperSupported && !isEyeDropperHidden"
					:text="UI_COLOR_PICKER.EYE_DROPPER"
					:size-scale="sizeScale">
					<BaseButton
						variant="outline"
						class="base-color-picker__eyedropper"
						:aria-label="UI_COLOR_PICKER.EYE_DROPPER"
						:size-scale="sizeScale"
						@click="pickFromScreen">
						<BaseIcon name="eyedropper" :size-scale="sizeScale" aria-label="" />
					</BaseButton>
				</BaseTooltip>
				<span class="base-color-picker__preview" :style="{ '--picker-swatch-color': swatchColor }" aria-hidden="true" />
				<div class="base-color-picker__sliders">
					<input
						class="base-color-picker__hue"
						type="range"
						min="0"
						max="360"
						:aria-label="UI_COLOR_PICKER.HUE"
						:value="picker.hsv.value.h"
						@input="handleHueInput" />
					<input
						v-if="hasAlpha"
						class="base-color-picker__alpha"
						type="range"
						min="0"
						max="100"
						:aria-label="UI_COLOR_PICKER.ALPHA"
						:aria-valuetext="`${alphaPercent}%`"
						:value="alphaPercent"
						:style="{ '--picker-alpha-color': picker.hex.value }"
						@input="handleAlphaInput" />
				</div>
			</div>

			<div v-if="!isHexHidden" class="base-color-picker__fields" :class="classes.fields">
				<div v-if="formats.length > 1" class="base-color-picker__formats" role="group" :aria-label="UI_COLOR_PICKER.FORMAT">
					<button
						v-for="item in formats"
						:key="item"
						type="button"
						class="base-color-picker__format"
						:class="{ 'base-color-picker__format--active': item === inputFormat }"
						:aria-pressed="item === inputFormat ? 'true' : 'false'"
						@click="setInputFormat(item)">
						{{ formatLabel(item) }}
					</button>
				</div>
				<div class="base-color-picker__inputs">
					<label v-if="inputFormat === 'hex'" class="base-color-picker__channel base-color-picker__channel--hex">
						<input
							class="base-color-picker__hex"
							type="text"
							spellcheck="false"
							autocomplete="off"
							:aria-label="UI_COLOR_PICKER.HEX_VALUE"
							:value="hexText"
							@change="handleHexChange" />
						<span class="base-color-picker__channel-caption" aria-hidden="true">{{ UI_COLOR_PICKER.FORMAT_HEX }}</span>
					</label>
					<label v-for="channel in channels" :key="channel.key" class="base-color-picker__channel">
						<input
							class="base-color-picker__channel-input"
							type="number"
							min="0"
							:max="channel.max"
							:aria-label="channel.label"
							:value="channel.value"
							@change="handleChannelChange(channel, $event)" />
						<span class="base-color-picker__channel-caption" aria-hidden="true">{{ channel.short }}</span>
					</label>
				</div>
			</div>

			<div v-if="hasSwatches" class="base-color-picker__library">
				<ColorSwatches
					v-if="!isPresetsHidden"
					:aria-label="UI_COLOR_PICKER.PRESETS"
					:colors="presets"
					:is-selected="isSwatchSelected"
					:swatch-class="classes.preset"
					@select="handleSwatchSelect" />
				<ColorSwatches
					v-for="palette in palettes"
					:key="palette.label"
					:label="palette.label"
					:colors="palette.colors"
					:is-selected="isSwatchSelected"
					:swatch-class="classes.preset"
					@select="handleSwatchSelect" />
				<ColorSwatches
					v-if="recentColors.length > 0"
					:label="UI_COLOR_PICKER.RECENT"
					:colors="recentColors"
					:is-selected="isSwatchSelected"
					:swatch-class="classes.preset"
					@select="handleSwatchSelect" />
			</div>

			<BaseButton
				v-if="isResettable"
				variant="outline"
				class="base-color-picker__reset"
				:custom-class="classes.reset"
				:size-scale="sizeScale"
				@click="handleReset">
				{{ resetLabel ?? UI_TEXT.NO_COLOR }}
			</BaseButton>
		</div>
	</BasePopover>
</template>

<script setup lang="ts">
import '../styles/BaseColorPicker.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BasePopover } from '@components/BasePopover'
import { BaseTooltip } from '@components/BaseTooltip'
import { COLOR_FORMATS } from '@utils/data/colorUtils'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_COLOR_PRESETS } from '../model/colorPresets'
import ColorSwatches from './ColorSwatches/ColorSwatches.vue'
import { UI_COLOR_PICKER, UI_TEXT } from '@/locales/messages'
import { useBaseColorPicker } from '../model/useBaseColorPicker'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseColorPickerEmits, BaseColorPickerProps, BaseColorPickerSlots } from '../types/BaseColorPicker.types'

const props = withDefaults(
	defineProps<BaseColorPickerProps>(),
	kitDefaults('BaseColorPicker', {
		format: 'hex',
		formats: () => COLOR_FORMATS,
		hasAlpha: false,
		position: 'bottom',
		palettes: () => [],
		maxRecentColors: 8,
		isRecentHidden: false,
		isEyeDropperHidden: false,
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
	areaRef,
	handleAreaPointerDown,
	handleAreaKeydown,
	inputFormat,
	channels,
	hexText,
	alphaPercent,
	swatchColor,
	formatLabel,
	setInputFormat,
	handleChannelChange,
	handleHexChange,
	handleHueInput,
	handleAlphaInput,
	recentColors,
	hasSwatches,
	isEyeDropperSupported,
	pickFromScreen,
	isSwatchSelected,
	handleSwatchSelect,
	handleReset,
	exposed,
} = useBaseColorPicker(props, emit)

defineExpose(exposed)
</script>
