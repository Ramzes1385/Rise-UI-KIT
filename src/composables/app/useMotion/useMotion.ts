/** Composable: пресет движения, признак «движение выключено», длительности и кривые из токенов — для JS-анимаций */

import { useReducedMotion } from '@composables/app/useReducedMotion'
import { computed, onBeforeUnmount, onMounted, ref, toValue } from 'vue'
import type { MotionTarget, UseMotionReturn } from './types/useMotion.types'
import {
	MOTION_ATTRIBUTE,
	REDUCED_MOTION_ATTRIBUTE,
	isMotionAlwaysReduced,
	readMotionDuration,
	readMotionEasing,
	readMotionPreset,
} from './motionTokens'

const attributeVersion = ref(0)
let observer: MutationObserver | null = null
let subscribers = 0

function subscribe(): void {
	subscribers++
	if (observer || typeof MutationObserver === 'undefined') return
	observer = new MutationObserver(() => {
		attributeVersion.value++
	})
	observer.observe(document.documentElement, {
		attributes: true,
		subtree: true,
		attributeFilter: [MOTION_ATTRIBUTE, REDUCED_MOTION_ATTRIBUTE],
	})
}

function unsubscribe(): void {
	subscribers--
	if (subscribers > 0) return
	observer?.disconnect()
	observer = null
}

/**
 * Пресет движения и токены для JS-анимаций. Пресет — у ближайшего предка элемента с `data-rise-motion`
 * (без элемента — у `<html>`), меняется вместе с атрибутом. Длительности читаются из CSS того же элемента, поэтому
 * пресет на области страницы действует и на JS. При `isReduced` длительность — `0`: анимацию нужно пропустить
 * и сразу поставить конечное состояние. Вызывать в `setup`.
 *
 * @example
 * ```ts
 * const root = ref<HTMLElement | null>(null)
 * const motion = useMotion(root)
 * element.animate(frames, { duration: motion.duration('slow'), easing: motion.easing('spring') })
 * ```
 */
export function useMotion(target?: MotionTarget): UseMotionReturn {
	const isSystemReduced = useReducedMotion()
	const element = (): Element | null => toValue(target) ?? null

	onMounted(subscribe)
	onBeforeUnmount(unsubscribe)

	const preset = computed(() => {
		void attributeVersion.value
		return readMotionPreset(element())
	})

	const isReduced = computed(() => {
		void attributeVersion.value
		return isSystemReduced.value || isMotionAlwaysReduced() || preset.value === 'none'
	})

	return {
		preset,
		isReduced,
		duration: (name = 'base') => (isReduced.value ? 0 : readMotionDuration(element(), name)),
		easing: (name = 'base') => readMotionEasing(element(), name),
	}
}
