import { computed, onMounted, ref } from 'vue'
import { clampIndex, fraction } from './timeline'
import { UI_PLAYER } from '@components/BaseMediaPlayer/model/messages'
import { UI_PRESENTATION, formatMessage, formatNumber } from './messages'
import type { PresentationControlsSource } from '../types/PresentationModel.types'
import type { BasePresentationPlayerProps } from '../types/BasePresentationPlayer.types'
import type { MediaMenuList } from '@components/BaseMediaPlayer/types/menus/MediaMenu.types'
import type { MediaIconName } from '@components/BaseMediaPlayer/types/controls/MediaIcon.types'

function volumeIcon(volume: number, isMuted: boolean): MediaIconName {
	if (isMuted || volume === 0) return 'volume-mute'
	if (volume < 0.34) return 'volume-low'
	return volume < 0.67 ? 'volume-medium' : 'volume-high'
}

function useSlideSlider(props: BasePresentationPlayerProps, source: PresentationControlsSource) {
	const statusOf = (index: number): string =>
		formatMessage(UI_PRESENTATION.STATUS, { n: index + 1, total: props.slides.length, title: props.slides[index]?.title ?? '' })
	const isMounted = ref(false)
	onMounted(() => (isMounted.value = true))
	return {
		sliderValue: computed(() => source.index() + fraction(source.slideTime(), source.slideDuration())),
		sliderMax: computed(() => props.slides.length),
		segments: computed(() => props.slides.map((_, index) => ({ start: index, end: index + 1 }))),
		valueText: computed(() => statusOf(source.index())),
		statusText: computed(() => (isMounted.value && props.slides.length ? statusOf(source.index()) : '')),
		hoverText: (value: number): string => {
			const index = clampIndex(Math.floor(value), props.slides.length)
			return formatMessage(UI_PRESENTATION.SLIDE_HINT, { n: index + 1, title: props.slides[index]?.title ?? '' })
		},
		onSeek(value: number): void {
			const index = clampIndex(Math.floor(value), props.slides.length)
			if (index !== source.index()) return source.goTo(index)
			const duration = source.slideDuration()
			if (duration > 0 && Number.isFinite(duration)) source.seekInSlide((value - index) * duration)
		},
	}
}

function useSpeedMenu(props: BasePresentationPlayerProps, source: PresentationControlsSource) {
	const label = (rate: number): string => `${formatNumber(rate)}×`
	return {
		rateText: computed(() => label(source.rate())),
		speedMenu: computed<MediaMenuList>(() => ({
			title: UI_PLAYER.SPEED_MENU,
			items: (props.playbackRates ?? []).map(rate => ({
				id: String(rate),
				label: label(rate),
				isChecked: Math.abs(rate - source.rate()) < 0.001,
				onSelect: () => source.setRate(rate),
			})),
		})),
	}
}

export function usePresentationControls(props: BasePresentationPlayerProps, source: PresentationControlsSource) {
	return {
		UI_PLAYER,
		UI_PRESENTATION,
		...useSlideSlider(props, source),
		...useSpeedMenu(props, source),
		playLabel: computed(() => (source.isPlaying() ? UI_PLAYER.PAUSE : UI_PLAYER.PLAY)),
		muteLabel: computed(() => (source.isMuted() ? UI_PLAYER.UNMUTE : UI_PLAYER.MUTE)),
		volumeIcon: computed(() => volumeIcon(source.volume(), source.isMuted())),
		volumeValue: computed(() => (source.isMuted() ? 0 : source.volume())),
		volumeValueText: computed(() =>
			formatNumber(source.isMuted() ? 0 : source.volume(), { style: 'percent', maximumFractionDigits: 0 }),
		),
		fullscreenLabel: computed(() => (source.isFullscreen() ? UI_PLAYER.EXIT_FULLSCREEN : UI_PLAYER.FULLSCREEN)),
	}
}
