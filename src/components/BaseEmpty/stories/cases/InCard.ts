import { expect } from 'storybook/test'
import type meta from '../BaseEmpty.stories'
import BaseEmpty from '../../ui/BaseEmpty.vue'
import { BaseCard } from '@components/BaseCard'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const InCard: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: { story: 'Внутри карточки — вариант `ghost`: без своей рамки и отступов, отступы даёт карточка.' },
			source: {
				code: [
					'<BaseCard title="Комментарии">',
					'  <BaseEmpty variant="ghost" icon="smile" title="Комментариев пока нет" description="…" />',
					'</BaseCard>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseEmpty, BaseCard },
		setup: () => ({ props: useArgsWithoutSlots(args, ['title', 'description', 'icon', 'variant']) }),
		template: `
			<div class="story-medium">
				<BaseCard title="Комментарии" subtitle="Задача «Макет главной страницы»">
					<BaseEmpty
						v-bind="props"
						variant="ghost"
						icon="smile"
						title="Комментариев пока нет"
						description="Напишите первым — участники получат уведомление." />
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const empty = canvas.getByRole('heading', { name: 'Комментариев пока нет' }).closest('.base-empty') as HTMLElement
		await expect(getComputedStyle(empty).padding).toBe('0px')
		await expect(getComputedStyle(empty).borderTopColor).toBe('rgba(0, 0, 0, 0)')
	},
}
