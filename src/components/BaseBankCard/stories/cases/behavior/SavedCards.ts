import { expect } from 'storybook/test'
import { BaseRadio } from '@components/BaseRadio'
import type meta from '../../BaseBankCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBankCard from '../../../ui/BaseBankCard.vue'
import { SAVED_CARD_OPTIONS, SAVED_CARDS } from '../../shared'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const cards = SAVED_CARDS
const options = SAVED_CARD_OPTIONS
const state = { picked: 'visa' }

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseBankCard v-for="(card, id) in cards" :key="id" v-bind="card" />
		</div>
		<BaseRadio v-model="picked" name="saved-card" label="Карта для оплаты" :options="options" is-vertical>
			<template #option="{ option }">
				<BaseBankCard v-bind="cards[option.value]" is-compact variant="ghost" />
			</template>
		</BaseRadio>
	</div>
`

export const SavedCards: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Сохранённые карты пользователя: сверху — полный вид, снизу — выбор карты для оплаты строками `isCompact` в слоте `option` BaseRadio.',
					'Истёкшая карта (01/20) помечена «Истекла» и недоступна для выбора. Имя радиокнопки — фраза карты для чтения с экрана и её название.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseBankCard', 'BaseRadio'],
				state,
				script: [`const cards = ${literal(cards)}`, `const options = ${literal(options)}`].join('\n'),
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseBankCard, BaseRadio },
		setup: useStorySetup(args, { state, data: { cards, options } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getAllByText('Истекла')).toHaveLength(2)
		await expect(canvas.getByRole('radio', { name: /American Express, номер заканчивается на 0005, срок истёк 01\/20/ })).toBeDisabled()

		const visa = canvas.getByRole('radio', { name: /Visa, номер заканчивается на 4242, срок до 12\/34/ })
		await userEvent.tab()
		await expect(visa).toHaveFocus()
		await expect(visa).toBeChecked()

		await userEvent.keyboard('{ArrowDown}')
		const mastercard = canvas.getByRole('radio', { name: /Mastercard, номер заканчивается на 4444/ })
		await expect(mastercard).toHaveFocus()
		await expect(mastercard).toBeChecked()

		await userEvent.keyboard('{ArrowDown}')
		await expect(canvas.getByRole('radio', { name: /Мир, номер заканчивается на 9019/ })).toBeChecked()

		await userEvent.keyboard('{ArrowDown}')
		await expect(visa).toHaveFocus()
		await expect(visa).toBeChecked()
	},
}
