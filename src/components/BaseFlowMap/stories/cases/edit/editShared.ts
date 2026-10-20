import { flowNode } from '../../shared'
import { expect, screen, waitFor, within } from 'storybook/test'
import type { BaseFlowMapProps } from '../../../types/BaseFlowMap.types'

type StoryCanvas = ReturnType<typeof within>

export const editModels = { data: 'data', mode: 'mode' }

export const editTemplate = `
	<BaseFlowMap v-bind="args" v-model:data="data" v-model:mode="mode" />
`

export const editArgs: Partial<BaseFlowMapProps> = {
	mode: 'edit',
	modes: ['view', 'edit', 'review'],
	height: '760px',
	particles: false,
}

const editStatus = (canvas: StoryCanvas): HTMLElement => canvas.getByRole('status', { name: 'Состояние правки' })

export const editNotices = (canvas: StoryCanvas): HTMLElement => canvas.getByRole('status', { name: 'Уведомления правки' })

export const expectStatus = (canvas: StoryCanvas, text: string | RegExp): Promise<void> =>
	waitFor(() => expect(editStatus(canvas)).toHaveTextContent(text))

const COMPACT_BREAKPOINT = 640
const EDIT_SIDE_PANELS = 564

export const isNarrowMap = (canvasElement: HTMLElement): boolean =>
	(canvasElement.querySelector('.base-flow-map')?.getBoundingClientRect().width ?? Infinity) - EDIT_SIDE_PANELS < COMPACT_BREAKPOINT

type PlayContext = {
	canvas: StoryCanvas
	canvasElement: HTMLElement
	userEvent: { click: (element: Element) => Promise<void>; keyboard: (keys: string) => Promise<void> }
}

export const expectEditCompact = async ({ canvas, canvasElement, userEvent }: PlayContext): Promise<void> => {
	await waitFor(() => expect(canvasElement.querySelector('.base-flow-map--compact')).not.toBeNull())
	await expect(canvas.queryByRole('toolbar', { name: 'Инструменты правки' })).toBeNull()
	await expect(canvas.queryByRole('complementary', { name: 'Палитра элементов' })).toBeNull()
	const drawer = await waitFor(async () => {
		await userEvent.click(flowNode(canvas, 'Orders'))
		return screen.getByRole('dialog', { name: 'Свойства и хуки' })
	})
	await expect(within(drawer).getByRole('textbox', { name: 'Имя' })).toHaveValue('Orders')
	await userEvent.keyboard('{Escape}')
	await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
}
