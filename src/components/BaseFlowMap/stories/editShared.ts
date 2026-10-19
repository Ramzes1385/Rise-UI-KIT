import { expect, waitFor, within } from 'storybook/test'
import type { BaseFlowMapProps } from '../types/BaseFlowMap.types'

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
	panels: ['toolbar'],
}

export const editStatus = (canvas: StoryCanvas): HTMLElement => canvas.getByRole('status', { name: 'Состояние правки' })

export const editNotices = (canvas: StoryCanvas): HTMLElement => canvas.getByRole('status', { name: 'Уведомления правки' })

export const expectStatus = (canvas: StoryCanvas, text: string | RegExp): Promise<void> =>
	waitFor(() => expect(editStatus(canvas)).toHaveTextContent(text))

export const isNarrowMap = (canvasElement: HTMLElement): boolean =>
	(canvasElement.querySelector('.base-flow-map')?.getBoundingClientRect().width ?? Infinity) < 640
