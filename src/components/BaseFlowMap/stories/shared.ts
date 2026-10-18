import type { within } from 'storybook/test'

type StoryCanvas = ReturnType<typeof within>

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const flowNode = (canvas: StoryCanvas, label: string): HTMLElement =>
	canvas.getByRole('graphics-object', { name: new RegExp(`^${escapeRegExp(label)}, `) })

export const flowNodes = (canvas: StoryCanvas): HTMLElement[] =>
	canvas.getAllByRole('graphics-object').filter((element: HTMLElement) => element.dataset.flowEntity === 'node')

export const flowEdge = (canvas: StoryCanvas, name: string): HTMLElement => canvas.getByRole('graphics-symbol', { name })

export const flowAnnouncer = (canvas: StoryCanvas): HTMLElement =>
	canvas.getAllByRole('status').find((element: HTMLElement) => element.classList.contains('base-flow-map__sr'))!
