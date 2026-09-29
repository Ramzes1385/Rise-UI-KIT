import { computed } from 'vue'
import { captionPreset } from './subtitles'
import { UI_PLAYER, formatNumber } from './messages'
import type { MediaMenusSource } from '../types/MediaControls.types'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
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

function radios<T>(values: readonly T[], menu: { current: T | null; label: (value: T) => string; select: (value: T) => void }) {
	return values.map((value): DropdownMenuItem => ({
		type: 'radio',
		label: menu.label(value),
		isChecked: value === menu.current,
		onUpdateChecked: () => menu.select(value),
	}))
}

function radioSubmenu<T>(title: string, values: readonly T[], menu: Parameters<typeof radios<T>>[1]): DropdownMenuItem {
	const current = menu.current === null ? null : menu.label(menu.current)
	return { label: current === null ? title : `${title}: ${current}`, children: radios(values, menu) }
}

function titled(title: string, ...groups: DropdownMenuItem[][]): DropdownMenuItem[][] {
	return [[{ type: 'label', label: title }], ...groups.filter(group => group.length > 0)]
}

function captionStyleItem(style: MediaCaptionStyle, update: (patch: Partial<MediaCaptionStyle>) => void): DropdownMenuItem {
	return {
		label: UI_PLAYER.CAPTIONS_STYLE,
		children: [
			radioSubmenu(UI_PLAYER.CAPTIONS_SIZE, MEDIA_CAPTION_SIZES, {
				current: style.size,
				label: size => formatNumber(size / 100, { style: 'percent' }),
				select: size => update({ size }),
			}),
			radioSubmenu(UI_PLAYER.CAPTIONS_COLOR, MEDIA_CAPTION_COLORS, {
				current: style.color,
				label: colorLabel,
				select: color => update({ color }),
			}),
			radioSubmenu(UI_PLAYER.CAPTIONS_BACKGROUND, MEDIA_CAPTION_BACKGROUNDS, {
				current: style.background,
				label: backgroundLabel,
				select: background => update({ background }),
			}),
			radioSubmenu(UI_PLAYER.CAPTIONS_POSITION, CAPTION_PRESETS, {
				current: captionPreset(style.position),
				label: presetLabel,
				select: preset => update({ position: MEDIA_CAPTION_PRESETS[preset] }),
			}),
		],
	}
}

function captionMenu(source: MediaMenusSource): DropdownMenuItem[][] {
	const tracks = source.captionTracks()
	const active = source.activeCaptionId()
	const choices = radios([{ id: null, label: UI_PLAYER.CAPTIONS_OFF }, ...tracks], {
		current: tracks.find(track => track.id === active) ?? null,
		label: track => track.label,
		select: track => source.selectCaption(track.id),
	})
	choices[0].isChecked = active === null || !tracks.some(track => track.id === active)
	const upload: DropdownMenuItem[] = source.canLoadCaptions() ? [{ label: UI_PLAYER.CAPTIONS_LOAD, onSelect: source.loadCaptions }] : []
	const style = tracks.length ? [captionStyleItem(source.captionStyle(), source.updateCaptionStyle)] : []
	return titled(UI_PLAYER.CAPTIONS, choices, upload, style)
}

export function useMediaMenus(source: MediaMenusSource) {
	const activeQuality = computed(() => source.qualities().find(option => option.id === source.activeQualityId()))
	const activeAudio = computed(() => source.audioOptions().find(option => option.id === source.activeAudioId()))
	return {
		rateText: computed(() => `${formatNumber(source.rate())}×`),
		qualityText: computed(() => activeQuality.value?.label ?? ''),
		audioText: computed(() => activeAudio.value?.label ?? ''),
		speedItems: computed(() =>
			titled(UI_PLAYER.SPEED_MENU, radios(source.rates(), { current: source.rate(), label: rateLabel, select: source.selectRate })),
		),
		qualityItems: computed(() =>
			titled(
				UI_PLAYER.QUALITY,
				radios(source.qualities(), {
					current: activeQuality.value ?? null,
					label: option => option.label,
					select: option => source.selectQuality(option.id),
				}),
			),
		),
		audioItems: computed(() =>
			titled(
				UI_PLAYER.AUDIO,
				radios(source.audioOptions(), {
					current: activeAudio.value ?? null,
					label: option => option.label,
					select: option => source.selectAudio(option.id),
				}),
			),
		),
		captionItems: computed(() => captionMenu(source)),
	}
}
