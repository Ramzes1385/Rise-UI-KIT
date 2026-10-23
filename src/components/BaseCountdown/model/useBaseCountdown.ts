import type { Ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { UI_COUNTDOWN } from '@/locales/messages'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import { countdownDigits, segmentDigits } from './digits/countdownDigits'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { clockSegments, clockText, orderedUnits, padded, splitRemaining, spokenTime, toTimestamp, unitCaption } from './time/countdownTime'
import type {
	BaseCountdownEmits,
	BaseCountdownProps,
	CountdownDirection,
	CountdownParts,
	CountdownUnit,
} from '../types/BaseCountdown.types'

const isHydrating = (): boolean => Boolean(getCurrentInstance()?.vnode.el)

function useTicker(target: () => number, onFinish: () => void) {
	const now = ref<number | null>(typeof window === 'undefined' || isHydrating() ? null : Date.now())
	const remaining = computed(() => {
		const total = now.value === null ? 0 : target() - now.value
		return Number.isFinite(total) ? Math.max(0, total) : 0
	})
	let timer: ReturnType<typeof setTimeout> | undefined
	const schedule = (): void => {
		clearTimeout(timer)
		if (remaining.value <= 0) return
		timer = setTimeout(tick, remaining.value % 1000 || 1000)
	}
	const tick = (): void => {
		const wasRunning = remaining.value > 0
		now.value = Date.now()
		if (wasRunning && remaining.value <= 0) onFinish()
		schedule()
	}
	const sync = (): void => {
		if (document.visibilityState === 'visible') tick()
	}
	onMounted(() => {
		tick()
		document.addEventListener('visibilitychange', sync)
	})
	onBeforeUnmount(() => {
		clearTimeout(timer)
		document.removeEventListener('visibilitychange', sync)
	})
	watch(target, () => {
		now.value = Date.now()
		schedule()
	})
	return { remaining, isPending: computed(() => now.value === null) }
}

const PENDING_VALUE = '--'
const PENDING_CLOCK = '--:--:--'

const pendingParts = (): CountdownParts => ({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isFinished: false })

function cellValue(parts: CountdownParts, unit: CountdownUnit, isPending: boolean): string {
	if (isPending) return PENDING_VALUE
	return unit === 'days' ? String(parts.days) : padded(parts[unit])
}

function useDigitMotion(props: BaseCountdownProps, remaining: Ref<number>) {
	const isReducedMotion = useReducedMotion()
	const direction = ref<CountdownDirection>('down')
	watch(remaining, (next, previous) => {
		direction.value = next > previous ? 'up' : 'down'
	})
	const animation = computed(() => (isReducedMotion.value ? 'none' : (props.digitAnimation ?? 'roll')))
	return {
		digitAnimation: animation,
		digitClasses: computed(() => [`base-countdown--digits-${animation.value}`, `base-countdown--count-${direction.value}`]),
	}
}

export function useBaseCountdown(props: BaseCountdownProps, emit: BaseCountdownEmits) {
	const { remaining, isPending } = useTicker(
		() => toTimestamp(props.to),
		() => emit('finish'),
	)
	const units = computed(() => orderedUnits(props.format ?? []))
	const parts = computed(() => (isPending.value ? pendingParts() : splitRemaining(remaining.value, units.value)))
	const label = computed(() => props.label || UI_COUNTDOWN.LABEL)
	return {
		...useStandardBaseComponent('base-countdown', props, ['root', 'unit', 'value', 'caption']),
		...useDigitMotion(props, remaining),
		ui: useUi(props, 'base-countdown'),
		parts,
		cells: computed(() =>
			units.value.map((unit: CountdownUnit) => {
				const value = cellValue(parts.value, unit, isPending.value)
				return { unit, value, digits: countdownDigits(value, unit), caption: unitCaption(parts.value[unit], unit) }
			}),
		),
		clock: computed(() => (isPending.value ? PENDING_CLOCK : clockText(parts.value, units.value))),
		clockDigits: computed(() =>
			isPending.value ? countdownDigits(PENDING_CLOCK, 'pending') : segmentDigits(clockSegments(parts.value, units.value)),
		),
		spoken: computed(() => (isPending.value ? label.value : spokenTime(remaining.value, label.value))),
	}
}
