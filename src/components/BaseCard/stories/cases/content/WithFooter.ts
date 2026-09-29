import { expect } from 'storybook/test'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const WithFooter: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Слот `footer` — подвал с действиями, отделён линией.' },
			source: {
				code: [
					'<BaseCard title="Уведомления">',
					'  …',
					'  <template #footer>',
					'    <BaseButton variant="outline">Отмена</BaseButton>',
					'    <BaseButton>Сохранить</BaseButton>',
					'  </template>',
					'</BaseCard>',
				].join('\n'),
			},
		},
	},
	args: {
		title: 'Уведомления',
		subtitle: 'Письма о задачах и комментариях',
		default: 'Присылать сводку раз в день, в 9:00 по московскому времени.',
	},
	render: args => ({
		components: { BaseCard, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), args }),
		template: `
			<div class="story-medium">
				<BaseCard v-bind="props">
					{{ args.default }}
					<template #footer>
						<div class="story-row" style="justify-content: flex-end; gap: 8px;">
							<BaseButton variant="outline">Отмена</BaseButton>
							<BaseButton>Сохранить</BaseButton>
						</div>
					</template>
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const save = canvas.getByRole('button', { name: 'Сохранить' })
		const footer = save.closest<HTMLElement>('.base-card__footer')
		await expect(footer).not.toBeNull()
		await expect(footer?.tagName).toBe('DIV')
	},
}
