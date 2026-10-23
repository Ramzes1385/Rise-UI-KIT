export const TO_SCRIPT = 'const to = Date.now() + ((2 * 24 + 5) * 60 + 42) * 60_000 + 17_000'

export const TO = Date.now() + ((2 * 24 + 5) * 60 + 42) * 60_000 + 17_000

export function displayText(element: Element | null): string {
	const copy = element?.cloneNode(true) as Element | undefined
	copy?.querySelectorAll('[class*="-leave-"]').forEach(leaving => leaving.remove())
	return copy?.textContent ?? ''
}

export function digitModes(canvasElement: Element): string[] {
	return [...canvasElement.querySelectorAll('.base-countdown')].map(
		root => [...root.classList].find(name => name.startsWith('base-countdown--digits-'))?.replace('base-countdown--digits-', '') ?? '',
	)
}

export const isReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches
