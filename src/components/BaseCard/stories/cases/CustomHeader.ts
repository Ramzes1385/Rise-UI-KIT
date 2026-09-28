import { expect } from 'storybook/test'
import type meta from '../BaseCard.stories'
import BaseCard from '../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, STORY_USERS } from '@/stories/helpers'

export const CustomHeader: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Слот `header` заменяет заголовок и подзаголовок: например, автор записи с аватаром.' },
			source: {
				code: [
					'<BaseCard>',
					'  <template #header>',
					'    <img :src="user.avatar" alt="" class="avatar" />',
					'    <div>{{ user.name }} · {{ user.role }}</div>',
					'  </template>',
					'  …',
					'</BaseCard>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'title', 'subtitle']), user: STORY_USERS[0] }),
		template: `
			<div class="story-medium">
				<BaseCard v-bind="props">
					<template #header>
						<div class="story-row" style="gap: 12px;">
							<img :src="user.avatar" alt="" width="40" height="40" style="border-radius: var(--rise-radius-full);" />
							<div>
								<div style="color: var(--rise-text-highlighted); font-weight: var(--rise-font-weight-medium);">{{ user.name }}</div>
								<div style="color: var(--rise-text-muted);">{{ user.role }}</div>
							</div>
						</div>
					</template>
					Подготовила макеты главной страницы. Жду комментариев до пятницы.
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Анна Смирнова')).toBeVisible()
		await expect(canvas.queryByRole('heading')).toBeNull()
	},
}
