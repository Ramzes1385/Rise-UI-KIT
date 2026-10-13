import { screen } from 'storybook/test'

export const SHOWCASE_OWN_ARGS = ['isOpen', 'onUpdate:isOpen'] as const

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}

export function resolveColor(value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	document.body.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved
}

export async function panelOf(text: string | RegExp): Promise<HTMLElement> {
	return (await screen.findByText(text)).closest('.base-dropdown__panel') as HTMLElement
}
