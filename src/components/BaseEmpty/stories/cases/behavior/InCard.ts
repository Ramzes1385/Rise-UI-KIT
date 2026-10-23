import { expect } from 'storybook/test'
import type meta from '../../BaseEmpty.stories'
import { BaseCard } from '@components/BaseCard'
import BaseEmpty from '../../../ui/BaseEmpty.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const hidden = ['title', 'description', 'icon', 'variant']

const template = `
	<div class="story-medium">
		<BaseCard title="Комментарии" subtitle="Задача «Макет главной страницы»">
			<BaseEmpty
				v-bind="args"
				variant="ghost"
				icon="smile"
				title="Комментариев пока нет"
				description="Напишите первым — участники получат уведомление." />
		</BaseCard>
	</div>
`

export const InCard: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: { story: 'Внутри карточки — вариант `ghost`: без своей рамки и отступов, отступы даёт карточка.' },
			source: storySource({ template, imports: ['BaseCard', 'BaseEmpty'], omit: hidden }),
		},
	},
	render: args => ({
		components: { BaseEmpty, BaseCard },
		setup: useStorySetup(args, { slots: hidden }),
		template,
	}),
	play: async ({ canvas }) => {
		const empty = canvas.getByRole('heading', { name: 'Комментариев пока нет' }).closest('.base-empty') as HTMLElement
		await expect(getComputedStyle(empty).padding).toBe('0px')
		await expect(getComputedStyle(empty).borderTopColor).toBe('rgba(0, 0, 0, 0)')
	},
}
