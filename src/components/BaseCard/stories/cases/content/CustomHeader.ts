import { expect } from 'storybook/test'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, STORY_USERS, storySource, useStorySetup } from '@/stories/helpers'

const user = STORY_USERS[0]

const template = `
	<div class="story-medium">
		<BaseCard v-bind="args">
			<template #header>
				<div class="story-row" style="gap: 12px;">
					<img :src="user.avatar" alt="" width="40" height="40" style="border-radius: var(--rise-radius-md);" />
					<div>
						<div style="color: var(--rise-text-highlighted); font-weight: var(--rise-font-weight-medium);">{{ user.name }}</div>
						<div style="color: var(--rise-text-muted);">{{ user.role }}</div>
					</div>
				</div>
			</template>
			Подготовила макеты главной страницы. Жду комментариев до пятницы.
		</BaseCard>
	</div>
`

export const CustomHeader: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Слот `header` заменяет заголовок и подзаголовок: например, автор записи с аватаром.' },
			source: storySource({
				template,
				imports: ['BaseCard'],
				script: `const user = ${literal(user)}`,
				omit: ['default', 'title', 'subtitle'],
			}),
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: useStorySetup(args, { data: { user }, slots: ['default', 'title', 'subtitle'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Анна Смирнова')).toBeVisible()
		await expect(canvas.queryByRole('heading')).toBeNull()
	},
}
