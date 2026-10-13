const DEFAULT_COLOR = 'var(--rise-primary)'

export function resolveColor(area: HTMLElement | null, color: string | undefined): string {
	const value = color ?? DEFAULT_COLOR
	if (!area || !value.includes('var(')) return value
	const probe = document.createElement('span')
	probe.style.color = value
	area.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved || value
}
