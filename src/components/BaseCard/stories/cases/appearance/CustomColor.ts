import { expect } from 'storybook/test'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: фон и текст карточки, заголовок и подзаголовок берут цвет текста.',
					'Вложенные компоненты (кнопка в подвале) цвет карточки не наследуют — у них свои цвета.',
				].join('\n'),
			},
		},
	},
	args: {
		title: 'Тариф «Команда»',
		subtitle: 'До 20 участников',
		color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } },
	},
	render: args => ({
		components: { BaseCard, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-narrow">
				<BaseCard v-bind="props">
					Общий календарь, отчёты и приоритетная поддержка.
					<template #footer>
						<BaseButton variant="shadow">Подключить</BaseButton>
					</template>
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const title = canvas.getByRole('heading', { name: 'Тариф «Команда»' })
		const card = title.closest('.base-card') as HTMLElement
		await expect(getComputedStyle(card).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(title).color).toBe('rgb(255, 255, 255)')
		const button = canvas.getByRole('button', { name: 'Подключить' })
		await expect(getComputedStyle(button).backgroundColor).not.toBe('rgb(109, 40, 217)')
	},
}
