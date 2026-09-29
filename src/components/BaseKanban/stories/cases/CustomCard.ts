import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../BaseKanban.stories'
import BaseKanban from '../../ui/BaseKanban.vue'
import { CARDS, SMALL_COLUMNS } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const CustomCard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Слот `card` — своя разметка карточки (без кнопок внутри), слот `column-footer` — действия колонки; `open` — клик или Enter.',
			},
		},
	},
	args: { columns: SMALL_COLUMNS },
	render: args => ({
		components: { BaseKanban },
		setup: () => ({ props: useArgsWithoutSlots(args), cards: ref(CARDS.slice(0, 5)), opened: ref('') }),
		template: `
			<div style="display: grid; gap: 12px">
				<BaseKanban v-bind="props" v-model:cards="cards" @open="opened = $event.title">
					<template #card="{ card, isDragging }">
						<span style="display: flex; justify-content: space-between; gap: 8px">
							<strong>{{ card.title }}</strong>
							<span aria-hidden="true">{{ isDragging ? '✋' : '⋮⋮' }}</span>
						</span>
						<span style="font-size: 12px">#{{ card.id.slice(1) }} · {{ card.tags?.join(', ') || 'без меток' }}</span>
					</template>
					<template #column-footer="{ column, cards: columnCards }">
						<p style="margin: 0; padding: 0 4px; font-size: 12px">{{ column.title }}: {{ columnCards.length }}</p>
					</template>
				</BaseKanban>
				<p style="margin: 0">Открыта: {{ opened || '—' }}</p>
			</div>`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Канбан-доска' }))
		await expect(canvas.getByText(/^Открыта:/)).toHaveTextContent('Открыта: Канбан-доска')
	},
}
