import { computed } from 'vue'
import { captionPreset } from '../captions/subtitles'
import { UI_PLAYER, formatMessage, formatNumber } from '../messages'
import type { MediaMenusSource } from '../../types/controls/MediaControls.types'
import type { MediaMenuItem, MediaMenuList } from '../../types/menus/MediaMenu.types'
import type {
	MediaCaptionColor,
	MediaCaptionStyle,
	MediaCaptionPreset,
	MediaCaptionBackground,
} from '../../types/content/MediaSubtitles.types'
import {
	MEDIA_CAPTION_SIZES,
	MEDIA_CAPTION_COLORS,
	MEDIA_CAPTION_PRESETS,
	MEDIA_CAPTION_BACKGROUNDS,
} from '../../types/content/MediaSubtitles.types'

const CAPTION_PRESETS = Object.keys(MEDIA_CAPTION_PRESETS) as MediaCaptionPreset[]

function colorLabel(color: MediaCaptionColor): string {
	return { white: UI_PLAYER.COLOR_WHITE, yellow: UI_PLAYER.COLOR_YELLOW, green: UI_PLAYER.COLOR_GREEN, cyan: UI_PLAYER.COLOR_CYAN }[color]
}

function backgroundLabel(background: MediaCaptionBackground): string {
	return { none: UI_PLAYER.BACKGROUND_NONE, semi: UI_PLAYER.BACKGROUND_SEMI, solid: UI_PLAYER.BACKGROUND_SOLID }[background]
}

function presetLabel(preset: MediaCaptionPreset): string {
	return preset === 'top' ? UI_PLAYER.POSITION_TOP : UI_PLAYER.POSITION_BOTTOM
}

function choices<T>(values: readonly T[], menu: { current: T | null; label: (value: T) => string; select: (value: T) => void }) {
	return values.map((value, index): MediaMenuItem => ({
		id: String(index),
		label: menu.label(value),
		isChecked: value === menu.current,
		onSelect: () => menu.select(value),
	}))
}

function choiceList<T>(
	heading: { id: string; title: string },
	values: readonly T[],
	menu: Parameters<typeof choices<T>>[1],
): MediaMenuItem {
	const { id, title } = heading
	return {
		id,
		label: title,
		hint: menu.current === null ? undefined : menu.label(menu.current),
		children: { title, items: choices(values, menu), isKeptOpen: true },
	}
}

function captionStyleItem(style: MediaCaptionStyle, update: (patch: Partial<MediaCaptionStyle>) => void): MediaMenuItem {
	return {
		id: 'style',
		label: UI_PLAYER.CAPTIONS_STYLE,
		children: {
			title: UI_PLAYER.CAPTIONS_STYLE,
			items: [
				choiceList({ id: 'size', title: UI_PLAYER.CAPTIONS_SIZE }, MEDIA_CAPTION_SIZES, {
					current: style.size,
					label: size => formatNumber(size / 100, { style: 'percent' }),
					select: size => update({ size }),
				}),
				choiceList({ id: 'color', title: UI_PLAYER.CAPTIONS_COLOR }, MEDIA_CAPTION_COLORS, {
					current: style.color,
					label: colorLabel,
					select: color => update({ color }),
				}),
				choiceList({ id: 'background', title: UI_PLAYER.CAPTIONS_BACKGROUND }, MEDIA_CAPTION_BACKGROUNDS, {
					current: style.background,
					label: backgroundLabel,
					select: background => update({ background }),
				}),
				choiceList({ id: 'position', title: UI_PLAYER.CAPTIONS_POSITION }, CAPTION_PRESETS, {
					current: captionPreset(style.position),
					label: presetLabel,
					select: preset => update({ position: MEDIA_CAPTION_PRESETS[preset] }),
				}),
			],
		},
	}
}

function captionMenu(source: MediaMenusSource): MediaMenuList {
	const tracks = source.captionTracks()
	const active = source.activeCaptionId()
	const current = tracks.find(track => track.id === active) ?? null
	const off: MediaMenuItem = {
		id: 'off',
		label: UI_PLAYER.CAPTIONS_OFF,
		isChecked: current === null,
		onSelect: () => source.selectCaption(null),
	}
	const items = tracks.map((track): MediaMenuItem => ({
		id: `track-${track.id}`,
		label: track.label,
		isChecked: track === current,
		onSelect: () => source.selectCaption(track.id),
	}))
	const style = tracks.length ? [captionStyleItem(source.captionStyle(), source.updateCaptionStyle)] : []
	const upload = source.canLoadCaptions() ? [{ id: 'upload', label: UI_PLAYER.CAPTIONS_LOAD, onSelect: source.loadCaptions }] : []
	return { title: UI_PLAYER.CAPTIONS, items: [off, ...items, ...style, ...upload] }
}

function optionMenu<T extends string | null>(
	title: string,
	options: Array<{ id: T; label: string }>,
	choice: { active: T | undefined; select: (id: T) => void },
): MediaMenuList {
	return {
		title,
		items: options.map(option => ({
			id: String(option.id),
			label: option.label,
			isChecked: option.id === choice.active,
			onSelect: () => choice.select(option.id),
		})),
	}
}

export function useMediaMenus(source: MediaMenusSource) {
	const activeQuality = computed(() => source.qualities().find(option => option.id === source.activeQualityId()))
	const activeAudio = computed(() => source.audioOptions().find(option => option.id === source.activeAudioId()))
	return {
		rateText: computed(() => `${formatNumber(source.rate())}×`),
		qualityText: computed(() => activeQuality.value?.text ?? activeQuality.value?.label ?? ''),
		audioHint: computed(() =>
			activeAudio.value ? formatMessage(UI_PLAYER.AUDIO_CURRENT, { name: activeAudio.value.label }) : UI_PLAYER.AUDIO,
		),
		qualityMenu: computed(() =>
			optionMenu(UI_PLAYER.QUALITY, source.qualities(), { active: source.activeQualityId(), select: source.selectQuality }),
		),
		audioMenu: computed(() =>
			optionMenu(UI_PLAYER.AUDIO, source.audioOptions(), { active: source.activeAudioId(), select: source.selectAudio }),
		),
		captionMenu: computed(() => captionMenu(source)),
	}
}
