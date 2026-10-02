import { COMPANY } from '../../shared'
import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDescriptions.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseDescriptions from '../../../ui/BaseDescriptions.vue'

const template = `
	<div class="story-stack">
		<div class="story-narrow"><BaseDescriptions v-bind="args" title="360 px" /></div>
		<div class="story-medium"><BaseDescriptions v-bind="args" title="560 px" /></div>
		<BaseDescriptions v-bind="args" title="Вся ширина" />
	</div>
`

function columnCount(list: HTMLElement): number {
	return getComputedStyle(list).gridTemplateColumns.split(' ').length
}

export const Responsive: StoryObj<typeof meta> = {
	args: { items: COMPANY, columns: 3, minItemWidth: 240 },
	parameters: {
		docs: {
			description: {
				story: [
					'Колонки по ширине контейнера, а не окна: не больше `columns`, каждая не уже `minItemWidth`. В 360 px — одна',
					'колонка, в 560 px — две, на всю ширину — до трёх. `span` поля не больше колонок, что поместились.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDescriptions'], omit: ['title'] }),
		},
		controls: { include: ['columns', 'minItemWidth', 'layout'] },
	},
	render: args => ({
		components: { BaseDescriptions },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [narrow, medium] = canvasElement.querySelectorAll<HTMLElement>('dl')
		await expect(columnCount(narrow)).toBe(1)
		await expect(columnCount(medium)).toBe(2)
	},
}
