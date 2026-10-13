import { readMotionDuration, readMotionEasing } from '@composables/app/useMotion'

const DURATION_SCALE = 1.3

function px(value: number): string {
	return `${value}px`
}

function closedFrame(gap: number): Record<string, string | number> {
	return { maxHeight: px(0), marginTop: px(-gap), paddingTop: px(0), opacity: 0 }
}

function openFrame(el: HTMLElement): Record<string, string | number> {
	return { maxHeight: px(el.offsetHeight), marginTop: px(0), paddingTop: getComputedStyle(el).paddingTop, opacity: 1 }
}

function play(el: Element, order: 'open' | 'close', done: () => void): void {
	const row = el as HTMLElement
	const duration = readMotionDuration(row, 'base') * DURATION_SCALE
	if (duration <= 0 || typeof row.animate !== 'function') {
		done()
		return
	}
	const gap = parseFloat(getComputedStyle(row.parentElement ?? row).rowGap) || 0
	const frames = [closedFrame(gap), openFrame(row)]
	const animation = row.animate(order === 'open' ? frames : frames.reverse(), { duration, easing: readMotionEasing(row, 'emphasized') })
	animation.onfinish = done
	animation.oncancel = done
}

export function useSeekRowTransition() {
	return {
		onSeekRowEnter: (el: Element, done: () => void): void => play(el, 'open', done),
		onSeekRowLeave: (el: Element, done: () => void): void => play(el, 'close', done),
	}
}
