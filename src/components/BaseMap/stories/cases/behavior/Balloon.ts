import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, waitFor, within } from 'storybook/test'
import { MOSCOW, OFFICES, isLiveMap, liveOrDemo } from '../../shared'
import { literal, storySource, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const MODELS = { selected: 'selected' } as const

const template = `
	<div class="story-stack">
		<BaseMap v-bind="args" v-model:selected="selected" :markers="markers">
			<template #balloon="{ marker, close }">
				<strong>{{ marker.title }}</strong>
				<p>Открыто ежедневно с 10:00 до 20:00</p>
				<BaseButton variant="outline" @click="close">Закрыть</BaseButton>
			</template>
		</BaseMap>
		<p class="story-label">Выбрана метка: {{ selected ?? 'нет' }}</p>
	</div>
`

export const Balloon: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `balloon` показывает окно над выбранной меткой; выбор — `v-model:selected` (`id` метки или `null`). Без слота выбор лишь отмечает метку.',
					'Клик или Enter по метке открывает балун (`aria-expanded`, `aria-controls` ведут на окно), повторный клик закрывает.',
					'Esc, клик по карте и `close` из слота закрывают балун; Esc и `close` возвращают фокус на метку. Переменную можно задать заранее — балун откроется сразу.',
					'С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseMap'],
				models: MODELS,
				script: `const markers = ${literal(OFFICES)}`,
			}),
			story: { inline: false, height: '460px' },
		},
		controls: { include: ['variant', 'sizeScale', 'height', 'zoom'] },
	},
	args: { ...liveOrDemo.args, center: MOSCOW, zoom: 12, selected: null },
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseButton, BaseMap },
		setup: useStorySetup(args, { models: MODELS, data: { markers: OFFICES } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const map = canvas.getByRole('region', { name: 'Карта' })
		const marker = await waitFor(() => within(map).getByRole('button', { name: 'Арбат' }))
		await expect(marker).toHaveAttribute('aria-expanded', 'false')
		marker.focus()
		await userEvent.keyboard('{Enter}')
		const balloon = await canvas.findByRole('dialog', { name: 'Арбат' })
		await expect(balloon).toHaveTextContent('Открыто ежедневно')
		await expect(marker).toHaveAttribute('aria-expanded', 'true')
		await expect(marker).toHaveAttribute('aria-controls', balloon.id)
		await expect(canvas.getByText('Выбрана метка: arbat')).toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull())
		await expect(marker).toHaveFocus()
		await expect(marker).toHaveAttribute('aria-expanded', 'false')
		await expect(canvas.getByText('Выбрана метка: нет')).toBeInTheDocument()

		await userEvent.click(marker)
		await userEvent.click(await canvas.findByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull())
		await expect(marker).toHaveFocus()

		if (isLiveMap) return
		await userEvent.click(marker)
		await canvas.findByRole('dialog', { name: 'Арбат' })
		await fireEvent.click(canvasElement.querySelector('.story-demo-map') as HTMLElement)
		await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull())
		await expect(canvas.getByText('Выбрана метка: нет')).toBeInTheDocument()
	},
}
