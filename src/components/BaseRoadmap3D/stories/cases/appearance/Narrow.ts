import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseRoadmap3D from '../../../ui/BaseRoadmap3D.vue'
import { imports, importsFrom, types } from '../../render'
import { docsFrame, STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { view: 'view', focused: 'focused', progress: 'progress' } as const

const template = `
	<div style="width: 375px; max-width: 100%">
		<BaseRoadmap3D v-bind="args" v-model:view="view" v-model:focused="focused" v-model:progress="progress" height="640px" />
	</div>
`

export const Narrow: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(700),
			description: {
				story: [
					'Телефон, 375 px: контейнер уже `compactBreakpoint` (640 px), поэтому остров рисуется без мелочи, этапы листаются кнопками',
					'«Предыдущий этап / Следующий этап» (44 px) и свайпом по полосе, панель этапа открывается нижней шторкой. Приложение на телефоне',
					'обычно ставит `view: "2d"` — переключатель «3D / 2D» в шапке возвращает остров. При «уменьшить движение» камера и машинка',
					'переходят без полёта.',
				].join('\n'),
			},
			source: storySource({ template, imports, importsFrom, models: MODELS, types }),
		},
		controls: { include: ['view', 'quality', 'isDisabled'] },
	},
	args: { focused: null },
	render: args => ({
		components: { BaseRoadmap3D },
		setup: useStorySetup(args, { models: MODELS, slots: [] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const next = await canvas.findByRole('button', { name: 'Следующий этап' })
		await expect(canvas.getByRole('button', { name: 'Предыдущий этап' })).toBeVisible()
		await userEvent.click(next)
		const panel = await canvas.findByRole('region', { name: 'Подробности темы' })
		await waitFor(() => expect(panel).toHaveClass('base-roadmap-3d__panel--sheet'), { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.click(within(panel).getByRole('button', { name: 'Закрыть панель' }))
		await waitFor(() => expect(canvas.queryByRole('region', { name: 'Подробности темы' })).toBeNull(), { timeout: STORY_WAIT_TIMEOUT })

		await userEvent.click(canvas.getByRole('radio', { name: '2D' }))
		await waitFor(() => expect(canvasElement.querySelector('canvas')).toBeNull(), { timeout: STORY_WAIT_TIMEOUT })
		await expect(await canvas.findByRole('button', { name: /^Pinia/ })).toBeVisible()

		await userEvent.click(canvas.getByRole('radio', { name: '3D' }))
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull(), { timeout: STORY_WAIT_TIMEOUT })
		await expect(await canvas.findByRole('button', { name: 'Следующий этап' })).toBeVisible()
	},
}
