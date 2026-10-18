import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { imports, models, types } from '../../render'
import { docsFrame, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div dir="rtl">
		<BaseRoadmap
			v-bind="args"
			v-model:progress="progress"
			v-model:expanded="expanded"
			v-model:selected="selected"
			v-model:filter="filter" />
	</div>
`

export const Rtl: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(820),
			description: {
				story: [
					'Справа налево (`dir="rtl"`): хребет и ветки тем зеркальны, «Старт» и цель меняются сторонами, панель темы — слева,',
					'кольца идут против часовой стрелки. Цифры, проценты, часы и названия технологий не переворачиваются.',
				].join('\n'),
			},
			source: storySource({ template, imports, models, types }),
		},
	},
	args: { selected: null },
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const root = canvas.getByRole('region', { name: 'Frontend-разработчик на Vue' })
		await expect(getComputedStyle(root).direction).toBe('rtl')
		await expect(await canvas.findByText(/14 из 26 тем/)).toBeVisible()
		await userEvent.click(await canvas.findByRole('button', { name: /^Pinia/ }))
		const side = canvasElement.querySelector<HTMLElement>('.base-roadmap__side')
		const area = canvasElement.querySelector('.base-roadmap__area') as HTMLElement
		if (side) await expect(side.getBoundingClientRect().left).toBeLessThan(area.getBoundingClientRect().left)
	},
}
