import { watch } from 'vue'
import { easeInOutCubic } from '@/scene3d/camera/cameraPose'
import type { Roadmap3DCarOptions } from '../../types/internal/roadmap3dCompose.types'

const CAR_SLOWDOWN = 4
const INTRO_MS = 2600

function easeOf(share: number): number {
	return easeInOutCubic(Math.min(1, Math.max(0, share)))
}

export function useCarMotion(options: Roadmap3DCarOptions) {
	const { content, snapshot } = options
	let shown = 0
	let stop: (() => void) | null = null
	let hasIntroPlayed = false

	function apply(fraction: number): void {
		shown = fraction
		content.value?.road.setProgress(fraction)
		content.value?.markers.setCar(fraction)
		options.invalidate()
	}

	function cancel(): void {
		stop?.()
		stop = null
	}

	function drive(target: number, duration: number): void {
		cancel()
		if (duration <= 0 || options.isReducedMotion() || Math.abs(target - shown) < 1e-4) return apply(target)
		const from = shown
		let elapsed = 0
		const off = options.animate(delta => {
			elapsed += delta * 1000
			apply(from + (target - from) * easeOf(elapsed / duration))
			if (elapsed < duration) return true
			cancel()
			return false
		})
		stop = off
	}

	watch(content, built => {
		cancel()
		if (!built) return
		const isIntro = !hasIntroPlayed && snapshot.value.progress > 0
		hasIntroPlayed = true
		apply(isIntro ? 0 : snapshot.value.progress)
		if (isIntro) drive(snapshot.value.progress, INTRO_MS)
	})

	watch(
		() => snapshot.value.progress,
		value => {
			if (content.value) drive(value, options.getDuration() * CAR_SLOWDOWN)
		},
	)

	return { cancel, getShown: () => shown }
}
