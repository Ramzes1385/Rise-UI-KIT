import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap3D from '../../../ui/BaseRoadmap3D.vue'
import { imports, importsFrom, types } from '../../render'
import { docsFrame, storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { view: 'view', progress: 'progress' } as const

const template = `
	<BaseRoadmap3D v-bind="args" v-model:view="view" v-model:progress="progress" />
`

export const Fallback2D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(760),
			description: {
				story: [
					"2D-вид (`view: '2d'`): BaseRoadmap с раскладкой `path`, теми же данными, прогрессом, хуками и слотами — полностью доступный путь.",
					'Так же путь выглядит без WebGL. Переключатель «3D / 2D» в шапке меняет `v-model:view`, в 2D его не видит только тот,',
					'у кого WebGL недоступен.',
				].join('\n'),
			},
			source: storySource({ template, imports, importsFrom, models: MODELS, types }),
		},
		controls: { include: ['view', 'isDisabled', 'sizeScale'] },
	},
	args: { view: '2d' },
	render: args => ({
		components: { BaseRoadmap3D },
		setup: useStorySetup(args, { models: MODELS, slots: [] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvasElement.querySelector('canvas')).toBeNull()
		await expect(await canvas.findByRole('radio', { name: '2D' })).toBeChecked()
		await expect(await canvas.findByRole('button', { name: /^Pinia/ })).toBeVisible()
		await expect(canvas.queryByRole('button', { name: 'Запустить тур' })).toBeNull()
	},
}
