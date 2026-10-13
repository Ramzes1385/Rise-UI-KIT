import { computed, onMounted, ref } from 'vue'
import { UI_PLAYER, formatNumber } from '../messages'
import { usePlayerContext } from '../player/usePlayerContext'

const SPEED_MIN = 0.25

const SPEED_MAX = 4

const SPEED_STEP = 0.05

function clampRate(value: number): number {
	return Math.min(SPEED_MAX, Math.max(SPEED_MIN, Math.round(value * 100) / 100))
}

export function useMediaSpeedPanel() {
	const { state, actions, rates } = usePlayerContext()
	const inputRef = ref<HTMLInputElement | null>(null)
	const rate = computed(() => state.playbackRate)
	const select = (value: number): void => actions.setPlaybackRate(clampRate(value))
	onMounted(() => inputRef.value?.focus())

	return {
		inputRef,
		UI_PLAYER,
		min: SPEED_MIN,
		max: SPEED_MAX,
		step: SPEED_STEP,
		rate,
		rateText: computed(() => `${formatNumber(rate.value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}×`),
		fill: computed(() => `${((clampRate(rate.value) - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * 100}%`),
		presets: computed(() =>
			rates.value.map(value => ({ value, label: formatNumber(value), isActive: Math.abs(value - rate.value) < 0.001 })),
		),
		select,
		decrease: (): void => select(rate.value - SPEED_STEP),
		increase: (): void => select(rate.value + SPEED_STEP),
		onInput: (event: Event): void => select(Number((event.target as HTMLInputElement).value)),
	}
}
