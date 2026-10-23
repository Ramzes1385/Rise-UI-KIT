import { computed, ref, watch } from 'vue'
import { UI_COLOR_PICKER } from '@/locales/messages'
import { toHTMLInputElement } from '@utils/dom/domUtils'
import type { ColorFormat } from '@utils/data/colorUtils'
import { clamp, formatColor } from '@utils/data/colorUtils'
import type { UseColorPickerReturn } from '@composables/form/useColorPicker'
import type { ColorChannelField, ColorChannelKey, ColorPickerProps } from '../types/BaseColorPicker.types'

const PERCENT = 100

function rgbChannels(picker: UseColorPickerReturn): ColorChannelField[] {
	const { r, g, b } = picker.rgb.value
	return [
		{ key: 'r', label: UI_COLOR_PICKER.RED, short: UI_COLOR_PICKER.SHORT_RED, value: r, max: 255 },
		{ key: 'g', label: UI_COLOR_PICKER.GREEN, short: UI_COLOR_PICKER.SHORT_GREEN, value: g, max: 255 },
		{ key: 'b', label: UI_COLOR_PICKER.BLUE, short: UI_COLOR_PICKER.SHORT_BLUE, value: b, max: 255 },
	]
}

function hslChannels(picker: UseColorPickerReturn): ColorChannelField[] {
	const { h, s, l } = picker.hsl.value
	return [
		{ key: 'h', label: UI_COLOR_PICKER.HUE, short: UI_COLOR_PICKER.SHORT_HUE, value: h, max: 360 },
		{ key: 's', label: UI_COLOR_PICKER.SATURATION, short: UI_COLOR_PICKER.SHORT_SATURATION, value: s, max: PERCENT },
		{ key: 'l', label: UI_COLOR_PICKER.LIGHTNESS, short: UI_COLOR_PICKER.SHORT_LIGHTNESS, value: l, max: PERCENT },
	]
}

function alphaChannel(picker: UseColorPickerReturn): ColorChannelField {
	return {
		key: 'a',
		label: UI_COLOR_PICKER.ALPHA,
		short: UI_COLOR_PICKER.SHORT_ALPHA,
		value: Math.round(picker.alpha.value * PERCENT),
		max: PERCENT,
	}
}

function applyChannel(picker: UseColorPickerReturn, key: ColorChannelKey, value: number): void {
	if (key === 'a') picker.setAlpha(value / PERCENT)
	else if (key === 'r' || key === 'g' || key === 'b') picker.setRgb({ [key]: value })
	else picker.setHsl({ [key]: value })
}

const FORMAT_LABELS: Record<ColorFormat, () => string> = {
	hex: () => UI_COLOR_PICKER.FORMAT_HEX,
	rgb: () => UI_COLOR_PICKER.FORMAT_RGB,
	hsl: () => UI_COLOR_PICKER.FORMAT_HSL,
}

function useHexField(props: ColorPickerProps, picker: UseColorPickerReturn) {
	const hexText = computed((): string => formatColor({ ...picker.rgb.value, a: props.hasAlpha ? picker.alpha.value : 1 }, 'hex'))
	const hexDraft = ref<string | null>(null)
	watch(hexText, () => {
		hexDraft.value = null
	})

	return {
		hexInputValue: computed((): string => hexDraft.value ?? hexText.value),
		handleHexInput(value: string | number): void {
			hexDraft.value = String(value)
		},
		handleHexChange(event: Event): void {
			const target = toHTMLInputElement(event.target)
			hexDraft.value = null
			if (target) picker.setHex(target.value)
		},
	}
}

export function useColorPickerFields(props: ColorPickerProps, picker: UseColorPickerReturn) {
	const inputFormat = ref<ColorFormat>(props.formats.includes(props.format) ? props.format : (props.formats[0] ?? 'hex'))
	const channels = computed((): ColorChannelField[] => {
		const base = { hex: [], rgb: rgbChannels(picker), hsl: hslChannels(picker) }[inputFormat.value]
		return props.hasAlpha ? [...base, alphaChannel(picker)] : base
	})

	return {
		...useHexField(props, picker),
		inputFormat,
		channels,
		alphaPercent: computed((): number => Math.round(picker.alpha.value * PERCENT)),
		swatchColor: computed((): string => formatColor({ ...picker.rgb.value, a: picker.alpha.value }, 'rgb')),
		formatLabel: (format: ColorFormat): string => FORMAT_LABELS[format](),
		setInputFormat(format: ColorFormat): void {
			inputFormat.value = format
		},
		handleChannelChange(channel: ColorChannelField, event: Event): void {
			const target = toHTMLInputElement(event.target)
			if (!target) return
			const value = Number.parseFloat(target.value)
			if (!Number.isFinite(value)) {
				target.value = String(channel.value)
				return
			}
			const next = clamp(Math.round(value), 0, channel.max)
			applyChannel(picker, channel.key, next)
			target.value = String(next)
		},
		handleHueInput(event: Event): void {
			const target = toHTMLInputElement(event.target)
			if (target) picker.setHue(Number(target.value))
		},
		handleAlphaInput(event: Event): void {
			const target = toHTMLInputElement(event.target)
			if (target) picker.setAlpha(Number(target.value) / PERCENT)
		},
	}
}
