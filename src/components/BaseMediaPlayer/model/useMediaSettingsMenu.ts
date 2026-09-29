import { computed } from 'vue'
import { captionPreset } from './subtitles'
import { UI_PLAYER } from '@/locales/messages'
import { formatNumber } from '@/locales/state'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import type { MediaSettingsMenuEmits, MediaSettingsMenuProps } from '../types/MediaSettingsMenu.types'
import type { MediaCaptionColor, MediaCaptionStyle, MediaCaptionPreset, MediaCaptionBackground } from '../types/MediaSubtitles.types'
import { MEDIA_CAPTION_SIZES, MEDIA_CAPTION_COLORS, MEDIA_CAPTION_PRESETS, MEDIA_CAPTION_BACKGROUNDS } from '../types/MediaSubtitles.types'

const CAPTION_PRESETS = Object.keys(MEDIA_CAPTION_PRESETS) as MediaCaptionPreset[]

function rateLabel(rate: number): string {
	return rate === 1 ? UI_PLAYER.SPEED_NORMAL : `${formatNumber(rate)}×`
}

function colorLabel(color: MediaCaptionColor): string {
	return { white: UI_PLAYER.COLOR_WHITE, yellow: UI_PLAYER.COLOR_YELLOW, green: UI_PLAYER.COLOR_GREEN, cyan: UI_PLAYER.COLOR_CYAN }[color]
}

function backgroundLabel(background: MediaCaptionBackground): string {
	return { none: UI_PLAYER.BACKGROUND_NONE, semi: UI_PLAYER.BACKGROUND_SEMI, solid: UI_PLAYER.BACKGROUND_SOLID }[background]
}

function presetLabel(preset: MediaCaptionPreset): string {
	return preset === 'top' ? UI_PLAYER.POSITION_TOP : UI_PLAYER.POSITION_BOTTOM
}

function radioSubmenu<T>(menu: {
	title: string
	values: readonly T[]
	current: T | null
	label: (value: T) => string
	select: (value: T) => void
}): DropdownMenuItem {
	const current = menu.current === null ? null : menu.label(menu.current)
	return {
		label: current === null ? menu.title : `${menu.title}: ${current}`,
		children: menu.values.map(value => ({
			type: 'radio',
			label: menu.label(value),
			isChecked: value === menu.current,
			onUpdateChecked: () => menu.select(value),
		})),
	}
}

function speedItem(props: MediaSettingsMenuProps, emit: MediaSettingsMenuEmits): DropdownMenuItem {
	return {
		label: `${UI_PLAYER.SPEED}: ${rateLabel(props.rate)}`,
		children: props.rates.map(rate => ({
			type: 'radio',
			label: rateLabel(rate),
			isChecked: rate === props.rate,
			onUpdateChecked: () => emit('select-rate', rate),
		})),
	}
}

function qualityItem(props: MediaSettingsMenuProps, emit: MediaSettingsMenuEmits): DropdownMenuItem {
	return {
		label: [UI_PLAYER.QUALITY, props.qualities.find(source => source.src === props.activeSrc)?.label].filter(Boolean).join(': '),
		children: props.qualities.map(source => ({
			type: 'radio',
			label: source.label,
			isChecked: source.src === props.activeSrc,
			onUpdateChecked: () => emit('select-quality', source),
		})),
	}
}

function captionsItem(props: MediaSettingsMenuProps, emit: MediaSettingsMenuEmits): DropdownMenuItem {
	const tracks = props.captionTracks ?? []
	const active = tracks.find(track => track.id === props.activeCaptionId)
	const choices: DropdownMenuItem[] = [{ id: null, label: UI_PLAYER.CAPTIONS_OFF }, ...tracks].map(track => ({
		type: 'radio',
		label: track.label,
		isChecked: track.id === (active?.id ?? null),
		onUpdateChecked: () => emit('select-caption', track.id),
	}))
	const upload: DropdownMenuItem = { label: UI_PLAYER.CAPTIONS_LOAD, onSelect: () => emit('load-captions') }
	return {
		label: `${UI_PLAYER.CAPTIONS}: ${active?.label ?? UI_PLAYER.CAPTIONS_OFF}`,
		children: props.canLoadCaptions ? [choices, [upload]] : [choices],
	}
}

function captionStyleItem(style: MediaCaptionStyle, emit: MediaSettingsMenuEmits): DropdownMenuItem {
	const update = (patch: Partial<MediaCaptionStyle>): void => emit('update-caption-style', patch)
	return {
		label: UI_PLAYER.CAPTIONS_STYLE,
		children: [
			radioSubmenu({
				title: UI_PLAYER.CAPTIONS_SIZE,
				values: MEDIA_CAPTION_SIZES,
				current: style.size,
				label: size => formatNumber(size / 100, { style: 'percent' }),
				select: size => update({ size }),
			}),
			radioSubmenu({
				title: UI_PLAYER.CAPTIONS_COLOR,
				values: MEDIA_CAPTION_COLORS,
				current: style.color,
				label: colorLabel,
				select: color => update({ color }),
			}),
			radioSubmenu({
				title: UI_PLAYER.CAPTIONS_BACKGROUND,
				values: MEDIA_CAPTION_BACKGROUNDS,
				current: style.background,
				label: backgroundLabel,
				select: background => update({ background }),
			}),
			radioSubmenu({
				title: UI_PLAYER.CAPTIONS_POSITION,
				values: CAPTION_PRESETS,
				current: captionPreset(style.position),
				label: presetLabel,
				select: preset => update({ position: MEDIA_CAPTION_PRESETS[preset] }),
			}),
		],
	}
}

function captionItems(props: MediaSettingsMenuProps, emit: MediaSettingsMenuEmits): DropdownMenuItem[] {
	const hasTracks = Boolean(props.captionTracks?.length)
	if (!hasTracks && !props.canLoadCaptions) return []
	const style = hasTracks && props.captionStyle ? [captionStyleItem(props.captionStyle, emit)] : []
	return [captionsItem(props, emit), ...style]
}

export function useMediaSettingsMenu(props: MediaSettingsMenuProps, emit: MediaSettingsMenuEmits) {
	return {
		label: computed(() => UI_PLAYER.SETTINGS),
		items: computed(() => [
			...captionItems(props, emit),
			speedItem(props, emit),
			...(props.qualities.length > 1 ? [qualityItem(props, emit)] : []),
		]),
	}
}
