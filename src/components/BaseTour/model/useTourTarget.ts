import { computed } from 'vue'
import type { TourGeometry, TourTargetOptions } from '../types/BaseTour.types'

function holeClipPath(spotlight: TourGeometry['spotlight']): string {
	const left = `${spotlight.left}px`
	const top = `${spotlight.top}px`
	const right = `${spotlight.left + spotlight.width}px`
	const bottom = `${spotlight.top + spotlight.height}px`
	const outer = '0 0, 100% 0, 100% 100%, 0 100%, 0 0'
	const inner = `${left} ${top}, ${left} ${bottom}, ${right} ${bottom}, ${right} ${top}, ${left} ${top}`
	return `polygon(evenodd, ${outer}, ${inner})`
}

export function useTourTarget(options: TourTargetOptions, getTarget: () => HTMLElement | null) {
	const { props, currentStep, geometry } = options

	const isTargetInteractive = computed((): boolean => {
		if (!geometry.value) return false
		return currentStep.value?.isTargetInteractive ?? props.behavior?.allowTargetInteraction ?? true
	})

	const overlayStyle = computed((): Record<string, string> | undefined => {
		const value = geometry.value
		if (!value || !isTargetInteractive.value) return undefined
		return { clipPath: holeClipPath(value.spotlight) }
	})

	return {
		isTargetInteractive,
		overlayStyle,
		getLinkedElements: (): HTMLElement[] => {
			const target = isTargetInteractive.value ? getTarget() : null
			return target ? [target] : []
		},
	}
}
