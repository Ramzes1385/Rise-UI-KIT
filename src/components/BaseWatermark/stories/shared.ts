import { expect, waitFor } from 'storybook/test'

export function watermarkLayer(canvasElement: HTMLElement): HTMLElement {
	return canvasElement.querySelector('.base-watermark__layer') as HTMLElement
}

export async function waitForPattern(layer: HTMLElement): Promise<void> {
	await waitFor(() => expect(getComputedStyle(layer).backgroundImage).toContain('url('))
}
