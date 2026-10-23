import { COMPANY } from '../../shared'
import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDescriptions.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseDescriptions from '../../../ui/BaseDescriptions.vue'

const template = `
	<div class="story-stack">
		<BaseDescriptions v-bind="args" title="horizontal" layout="horizontal" />
		<BaseDescriptions v-bind="args" title="vertical" layout="vertical" />
	</div>
`

export const Layouts: StoryObj<typeof meta> = {
	args: { items: COMPANY },
	parameters: {
		docs: {
			description: {
				story: [
					'Раскладки поля: `horizontal` — подпись слева шириной `labelWidth` (по умолчанию 40 % колонки), длинное значение',
					'в узкой колонке переносится под подпись; `vertical` — подпись над значением, удобно для плотной сетки.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDescriptions'], omit: ['title', 'layout'] }),
		},
		controls: { include: ['columns', 'minItemWidth', 'labelWidth', 'variant'] },
	},
	render: args => ({
		components: { BaseDescriptions },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const horizontal = canvasElement.querySelector('.base-descriptions--horizontal .base-descriptions__item') as HTMLElement
		const vertical = canvasElement.querySelector('.base-descriptions--vertical .base-descriptions__item') as HTMLElement
		await expect(getComputedStyle(horizontal).flexDirection).toBe('row')
		await expect(getComputedStyle(vertical).flexDirection).toBe('column')
	},
}
