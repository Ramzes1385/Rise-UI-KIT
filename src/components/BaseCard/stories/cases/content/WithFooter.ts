import { expect } from 'storybook/test'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-medium">
		<BaseCard v-bind="args">
			{{ slots.default }}
			<template #footer>
				<div class="story-row" style="justify-content: flex-end; gap: 8px;">
					<BaseButton variant="outline">Отмена</BaseButton>
					<BaseButton>Сохранить</BaseButton>
				</div>
			</template>
		</BaseCard>
	</div>
`

export const WithFooter: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Слот `footer` — подвал с действиями, отделён линией.' },
			source: storySource({ template, imports: ['BaseCard', 'BaseButton'] }),
		},
	},
	args: {
		title: 'Уведомления',
		subtitle: 'Письма о задачах и комментариях',
		default: 'Присылать сводку раз в день, в 9:00 по московскому времени.',
	},
	render: args => ({
		components: { BaseCard, BaseButton },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const save = canvas.getByRole('button', { name: 'Сохранить' })
		const footer = save.closest<HTMLElement>('.base-card__footer')
		await expect(footer).not.toBeNull()
		await expect(footer?.tagName).toBe('DIV')
	},
}
