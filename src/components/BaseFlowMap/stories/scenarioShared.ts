import { within } from 'storybook/test'

type StoryCanvas = ReturnType<typeof within>

export const scenarioPanel = (canvas: StoryCanvas): HTMLElement => canvas.getByRole('region', { name: 'Сценарий' })

export const scenarioStep = (canvas: StoryCanvas, title: RegExp | string): HTMLElement =>
	within(scenarioPanel(canvas)).getByRole('button', { name: title })

export const scenarioSteps = (canvas: StoryCanvas): HTMLElement[] =>
	within(within(scenarioPanel(canvas)).getByRole('list', { name: 'Шаги сценария' })).getAllByRole('button')

export const panelButton = (canvas: StoryCanvas, name: string): HTMLElement => within(scenarioPanel(canvas)).getByRole('button', { name })
