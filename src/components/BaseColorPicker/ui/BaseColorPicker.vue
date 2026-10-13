<template>
	<BasePopover
		v-model:is-open="isOpen"
		:position="position"
		max-height="calc(100vh - 16px)"
		:size-scale="sizeScale"
		:custom-class="{ root: classes.root, panel: ui('popover') }"
		:class="ui('root')">
		<template #trigger>
			<button
				v-bind="triggerAttrs"
				ref="swatchRef"
				type="button"
				:class="[
					ui('swatch'),
					{ 'base-color-picker__swatch--translucent': !hasTransparentSwatch && alphaPercent < 100 },
					classes.swatch,
				]"
				:style="hasTransparentSwatch ? undefined : { backgroundColor: swatchColor, '--picker-swatch-color': swatchColor }"
				:disabled="isDisabled"
				:aria-expanded="isOpen ? 'true' : 'false'">
				<slot name="trigger" />
			</button>
		</template>

		<div
			:class="[ui('panel'), { 'base-color-picker__panel--instant': isMotionInstant }, classes.panel]"
			:data-rise-motion="motionScope">
			<div
				ref="areaRef"
				:class="ui('area')"
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
				<span :class="ui('marker')" :style="markerStyle" />
			</div>

			<div :class="ui('controls')">
				<BaseTooltip
					v-if="isEyeDropperSupported && !isEyeDropperHidden"
					:text="UI_COLOR_PICKER.EYE_DROPPER"
					:size-scale="sizeScale">
					<BaseButton
						variant="outline"
						:class="ui('eyedropper')"
						:aria-label="UI_COLOR_PICKER.EYE_DROPPER"
						:size-scale="sizeScale"
						@click="pickFromScreen">
						<BaseIcon name="eyedropper" :size-scale="sizeScale" aria-label="" />
					</BaseButton>
				</BaseTooltip>
				<span :class="ui('preview')" :style="{ '--picker-swatch-color': swatchColor }" aria-hidden="true" />
				<div :class="ui('sliders')">
					<div :class="ui('track')" :style="hueThumbStyle">
						<input
							:class="ui('hue')"
							type="range"
							min="0"
							max="360"
							:aria-label="UI_COLOR_PICKER.HUE"
							:value="picker.hsv.value.h"
							@pointerdown="handleSliderPointerDown"
							@input="handleHueInput" />
						<span :class="ui('thumb')" aria-hidden="true" />
					</div>
					<div v-if="hasAlpha" :class="ui('track')" :style="alphaThumbStyle">
						<input
							:class="ui('alpha')"
							type="range"
							min="0"
							max="100"
							:aria-label="UI_COLOR_PICKER.ALPHA"
							:aria-valuetext="`${alphaPercent}%`"
							:value="alphaPercent"
							:style="{ '--picker-alpha-color': picker.hex.value }"
							@pointerdown="handleSliderPointerDown"
							@input="handleAlphaInput" />
						<span :class="ui('thumb')" aria-hidden="true" />
					</div>
				</div>
			</div>

			<div v-if="!isHexHidden" :class="[ui('fields'), classes.fields]">
				<div v-if="formats.length > 1" :class="ui('formats')" role="group" :aria-label="UI_COLOR_PICKER.FORMAT">
					<button
						v-for="item in formats"
						:key="item"
						type="button"
						:class="[ui('format'), { 'base-color-picker__format--active': item === inputFormat }]"
						:aria-pressed="item === inputFormat ? 'true' : 'false'"
						@click="setInputFormat(item)">
						{{ formatLabel(item) }}
					</button>
				</div>
				<div :class="ui('inputs')">
					<div v-if="inputFormat === 'hex'" :class="[ui('channel'), 'base-color-picker__channel--hex']">
						<BaseInput
							:custom-class="{ field: ui('hex') }"
							:size-scale="sizeScale"
							:aria-label="UI_COLOR_PICKER.HEX_VALUE"
							:model-value="hexText"
							:input-attrs="{ spellcheck: 'false', autocomplete: 'off' }"
							@change="handleHexChange" />
						<span :class="ui('channel-caption')" aria-hidden="true">{{ UI_COLOR_PICKER.FORMAT_HEX }}</span>
					</div>
					<div v-for="channel in channels" :key="channel.key" :class="ui('channel')">
						<BaseInput
							:custom-class="{ field: ui('channel-input') }"
							:size-scale="sizeScale"
							type="number"
							:aria-label="channel.label"
							:model-value="channel.value"
							:input-attrs="{ min: 0, max: channel.max }"
							@change="handleChannelChange(channel, $event)" />
						<span :class="ui('channel-caption')" aria-hidden="true">{{ channel.short }}</span>
					</div>
				</div>
			</div>

			<div v-if="hasSwatches" :class="ui('library')">
				<ColorSwatches
					v-if="!isPresetsHidden"
					:aria-label="UI_COLOR_PICKER.PRESETS"
					:colors="presets"
					:is-selected="isSwatchSelected"
					:swatch-class="classes.preset"
					:ui="ui"
					@select="handleSwatchSelect" />
				<ColorSwatches
					v-for="palette in palettes"
					:key="palette.label"
					:label="palette.label"
					:colors="palette.colors"
					:is-selected="isSwatchSelected"
					:swatch-class="classes.preset"
					:ui="ui"
					@select="handleSwatchSelect" />
				<ColorSwatches
					v-if="recentColors.length > 0"
					:label="UI_COLOR_PICKER.RECENT"
					:colors="recentColors"
					:is-selected="isSwatchSelected"
					:swatch-class="classes.preset"
					:ui="ui"
					@select="handleSwatchSelect" />
			</div>

			<BaseButton
				v-if="isResettable"
				variant="outline"
				:class="ui('reset')"
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
import { BaseInput } from '@components/BaseInput'
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
	ui,
	classes,
	swatchRef,
	isOpen,
	picker,
	triggerAttrs,
	areaRef,
	handleAreaPointerDown,
	handleAreaKeydown,
	isMotionInstant,
	motionScope,
	markerStyle,
	hueThumbStyle,
	alphaThumbStyle,
	handleSliderPointerDown,
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
