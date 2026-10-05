/** Composable: настройки движения для JS-анимаций — признак выключенного движения и длительности из токенов `--rise-duration*` */

import type { MaybeRefOrGetter } from 'vue'
import { computed, onMounted, ref, toValue } from 'vue'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import type { MotionDuration, UseMotionReturn } from './types/useMotion.types'

const MOTION_ATTRIBUTE = 'data-rise-motion'
const NO_MOTION_PRESET = 'none'
const SECOND_MS = 1000
const MIN_DURATION_MS = 1

const FALLBACK_DURATIONS: Record<MotionDuration, number> = {
	fast: 150,
	base: 200,
	slow: 300,
	xslow: 500,
}

function tokenName(name: MotionDuration): string {
	return name === 'base' ? '--rise-duration' : `--rise-duration-${name}`
}

function parseDuration(raw: string): number {
	const value = raw.trim()
	const amount = Number.parseFloat(value)
	if (!Number.isFinite(amount)) return Number.NaN
	return value.endsWith('ms') ? amount : amount * SECOND_MS
}

/**
 * Настройки движения для JS-анимаций: одни и те же токены управляют CSS и JS.
 * `isReduced` — системная настройка «уменьшить движение» или пресет `data-rise-motion="none"` у элемента или предка
 * (пресет читается при монтировании). `duration(name)` читает `--rise-duration*` из `getComputedStyle` элемента
 * (без элемента — корня документа), без токена — значение пресета `standard`; при выключенном движении — `0`.
 *
 * @example
 * ```ts
 * const root = useTemplateRef<HTMLElement>('root')
 * const motion = useMotion(root)
 * const ms = motion.duration('xslow')
 * ```
 */
export function useMotion(target?: MaybeRefOrGetter<Element | null | undefined>): UseMotionReturn {
	const isSystemReduced = useReducedMotion()
	const isNonePreset = ref(false)

	function element(): Element {
		return toValue(target) ?? document.documentElement
	}

	onMounted(() => {
		const preset = element().closest(`[${MOTION_ATTRIBUTE}]`)?.getAttribute(MOTION_ATTRIBUTE)
		isNonePreset.value = preset === NO_MOTION_PRESET
	})

	const isReduced = computed(() => isSystemReduced.value || isNonePreset.value)

	function duration(name: MotionDuration = 'base'): number {
		if (isReduced.value) return 0
		const parsed = parseDuration(getComputedStyle(element()).getPropertyValue(tokenName(name)))
		if (Number.isNaN(parsed)) return FALLBACK_DURATIONS[name]
		return parsed < MIN_DURATION_MS ? 0 : parsed
	}

	return { isReduced, duration }
}
