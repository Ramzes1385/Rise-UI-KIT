import { expect } from 'storybook/test'
import type meta from '../../BaseBadge.stories'
import { BaseIcon } from '@components/BaseIcon'
import BaseBadge from '../../../ui/BaseBadge.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row">
		<BaseBadge v-bind="args" variant="soft">
			<BaseIcon name="check" :size-scale="80" />
			Проверено
		</BaseBadge>
		<BaseBadge v-bind="args" variant="outline">
			<BaseIcon name="calendar" :size-scale="80" />
			15 мая
		</BaseBadge>
	</div>
`

export const WithIcon: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Слот по умолчанию: иконка 16px (`:size-scale="80"`) и текст. Отступ между ними — 4px.' },
			source: storySource({ template, imports: ['BaseBadge', 'BaseIcon'], omit: ['default', 'label'] }),
		},
	},
	render: args => ({
		components: { BaseBadge, BaseIcon },
		setup: useStorySetup(args, { slots: ['default', 'label'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const badge = canvas.getByText('Проверено')
		await expect(badge.getBoundingClientRect().height).toBe(20)
	},
}
