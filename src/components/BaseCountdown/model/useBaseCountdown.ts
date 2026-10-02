import { UI_COUNTDOWN } from '@/locales/messages'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseCountdownEmits, BaseCountdownProps, CountdownUnit } from '../types/BaseCountdown.types'
import { clockText, orderedUnits, padded, splitRemaining, spokenTime, toTimestamp, unitCaption } from './time/countdownTime'

function useTicker(target: () => number, onFinish: () => void) {
	const now = ref(Date.now())
	const remaining = computed(() => {
		const total = target() - now.value
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
	return remaining
}

export function useBaseCountdown(props: BaseCountdownProps, emit: BaseCountdownEmits) {
	const remaining = useTicker(
		() => toTimestamp(props.to),
		() => emit('finish'),
	)
	const units = computed(() => orderedUnits(props.format ?? []))
	const parts = computed(() => splitRemaining(remaining.value, units.value))
	return {
		...useStandardBaseComponent('base-countdown', props, ['root', 'unit', 'value', 'caption']),
		parts,
		cells: computed(() =>
			units.value.map((unit: CountdownUnit) => ({
				unit,
				value: unit === 'days' ? String(parts.value.days) : padded(parts.value[unit]),
				caption: unitCaption(parts.value[unit], unit),
			})),
		),
		clock: computed(() => clockText(parts.value, units.value)),
		spoken: computed(() => spokenTime(remaining.value, props.label || UI_COUNTDOWN.LABEL)),
	}
}
