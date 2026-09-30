import { expect } from 'storybook/test'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { TEXT_TAGS } from '../../../types/BaseText.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const tags = TEXT_TAGS

const template = `
	<div class="story-col">
		<div v-for="tag in tags" :key="tag" class="story-row">
			<span class="story-label">&lt;{{ tag }}&gt;</span>
			<BaseText v-bind="args" :tag="tag">Итоги квартала</BaseText>
		</div>
	</div>
`

export const Tags: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'weight'] },
		docs: {
			description: {
				story: [
					'`tag` меняет только семантику: `h2` озвучивается как заголовок второго уровня, но выглядит как обычный текст.',
					'Размер и начертание заголовка задаются `sizeScale` и `weight` — даже `strong` без `weight` остаётся 400.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseText'], script: `const tags = ${literal(tags)}`, omit: ['default', 'tag'] }),
		},
	},
	render: args => ({
		components: { BaseText },
		setup: useStorySetup(args, { data: { tags }, slots: ['default', 'tag'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('heading', { level: 2, name: 'Итоги квартала' })).toBeVisible()
		const [paragraph] = canvas.getAllByText('Итоги квартала')
		const heading = canvas.getByRole('heading', { level: 1 })
		await expect(getComputedStyle(heading).fontSize).toBe(getComputedStyle(paragraph).fontSize)
	},
}
