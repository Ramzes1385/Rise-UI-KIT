import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap3D from '../../../ui/BaseRoadmap3D.vue'
import { imports, importsFrom, models, types } from '../../render'
import { docsFrame, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div dir="rtl">
		<BaseRoadmap3D
			v-bind="args"
			v-model:progress="progress"
			v-model:selected="selected"
			v-model:view="view"
			v-model:camera="camera"
			v-model:focused="focused"
			v-model:is-tour-playing="isTourPlaying" />
	</div>
`

export const Rtl: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(700),
			description: {
				story: [
					'Справа налево (`dir="rtl"`): шапка, полоса этапов и панель этапа зеркальны, панель открывается слева, стрелки «Предыдущий / Следующий»',
					'меняют направление. Остров — сцена three.js — не зеркалится: подписи этапов остаются у своих пьедесталов.',
				].join('\n'),
			},
			source: storySource({ template, imports, importsFrom, models, types }),
		},
	},
	args: { focused: 's4' },
	render: args => ({
		components: { BaseRoadmap3D },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		const root = await canvas.findByRole('region', { name: 'Frontend-разработчик на Vue' })
		await expect(getComputedStyle(root).direction).toBe('rtl')
		const panel = await canvas.findByRole('region', { name: 'Подробности темы' })
		await expect(panel).toBeVisible()
	},
}
