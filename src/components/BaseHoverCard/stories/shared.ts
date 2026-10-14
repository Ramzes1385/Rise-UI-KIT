import { screen } from 'storybook/test'

export const SHOWCASE_OWN_ARGS = ['isOpen', 'onUpdate:isOpen'] as const

export async function panelOf(text: string | RegExp): Promise<HTMLElement> {
	return (await screen.findByText(text)).closest('.base-dropdown__panel') as HTMLElement
}
