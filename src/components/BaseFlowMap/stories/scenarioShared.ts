import { expect, screen, waitFor, within } from 'storybook/test'

type StoryCanvas = ReturnType<typeof within>
type StoryUser = { click: (element: Element) => Promise<void>; keyboard: (keys: string) => Promise<void> }

const COMPACT_WIDTH = 640

export const isCompact = async (canvasElement: HTMLElement): Promise<boolean> => {
	const width = canvasElement.querySelector('.base-flow-map')?.getBoundingClientRect().width ?? Infinity
	if (width >= COMPACT_WIDTH) return false
	await waitFor(() => expect(canvasElement.querySelector('.base-flow-map--compact')).not.toBeNull())
	return true
}

export const waitScenario = async (canvas: StoryCanvas, compact = false): Promise<HTMLElement> =>
	compact ? canvas.findByRole('group', { name: 'Сценарий' }) : canvas.findByRole('region', { name: 'Сценарий' })

export const scenarioPanel = (canvas: StoryCanvas): HTMLElement => canvas.getByRole('region', { name: 'Сценарий' })

export const scenarioStep = (canvas: StoryCanvas, title: RegExp | string): HTMLElement =>
	within(scenarioPanel(canvas)).getByRole('button', { name: title })

export const scenarioSteps = (canvas: StoryCanvas): HTMLElement[] =>
	within(within(scenarioPanel(canvas)).getByRole('list', { name: 'Шаги сценария' })).getAllByRole('button')

export const panelButton = (canvas: StoryCanvas, name: string): HTMLElement => within(scenarioPanel(canvas)).getByRole('button', { name })

const compactPlayer = (canvas: StoryCanvas): HTMLElement => canvas.getByRole('group', { name: 'Сценарий' })

export const compactTotal = async (canvas: StoryCanvas, userEvent: StoryUser): Promise<number> => {
	const player = compactPlayer(canvas)
	await userEvent.click(within(player).getByRole('button', { name: 'Следующий шаг' }))
	await expect(player).toHaveTextContent(/Шаг \d+ из \d+/)
	return Number(/из (\d+)/.exec(player.textContent ?? '')?.[1])
}

type PlayContext = { canvas: StoryCanvas; canvasElement: HTMLElement; userEvent: StoryUser }

export const expectDetails = async ({ canvas, canvasElement, userEvent }: PlayContext, text: string | RegExp): Promise<void> => {
	if (!(await isCompact(canvasElement))) {
		await expect(await canvas.findByRole('region', { name: 'Подробности узла' })).toHaveTextContent(text)
		return
	}
	await expect(await screen.findByRole('dialog')).toHaveTextContent(text)
	await userEvent.keyboard('{Escape}')
	await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
}
