import { expect } from 'storybook/test'
import BaseTag from '../../../ui/BaseTag.vue'
import type meta from '../../BaseTag.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { TAG_TONES } from '../../../types/BaseTag.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseTag v-for="tone in TAG_TONES" :key="tone" v-bind="args" :tone="tone" :label="tone" />
		</div>
		<div class="story-row">
			<BaseTag v-for="tone in TAG_TONES" :key="tone" v-bind="args" :tone="tone" :label="tone" is-selected />
		</div>
	</div>
`

export const Tones: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: 'Цвета ролей `tone`: в первой строке — обычные метки, во второй — выбранные. Токены ролей пересчитываются в тёмной теме, контраст текста — не ниже 4.5:1.',
			},
			source: storySource({ template, imports: ['BaseTag', 'TAG_TONES'], omit: ['tone', 'label', 'isSelected'] }),
		},
	},
	render: args => ({
		components: { BaseTag },
		setup: useStorySetup(args, { data: { TAG_TONES }, slots: ['default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const success = canvas.getAllByRole('button', { name: 'success' })
		await expect(success[0]?.closest('.base-tag')).toHaveClass('base-tag--tone-success')
		await expect(success[1]).toHaveAttribute('aria-pressed', 'true')
	},
}
