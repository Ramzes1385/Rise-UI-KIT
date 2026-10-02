import { listTitles } from '../../shared'
import { setup } from './WithActions.setup'
import type meta from '../../BaseList.stories'
import BaseList from '../../../ui/BaseList.vue'
import { BaseIcon } from '@components/BaseIcon'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import setupSource from './WithActions.setup.ts?raw'
import type { StoryObj } from '@storybook/vue3-vite'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow">
		<BaseList ref="list" v-model:items="tasks" label="Задачи" is-sortable>
			<template #actions="{ item, index }">
				<BaseButton
					variant="ghost"
					:padding="{ x: 5, y: 5 }"
					:aria-label="'Выше: ' + item.title"
					:is-disabled="index === 0"
					@click="moveBy(item.id, -1)">
					<BaseIcon name="chevron-up" />
				</BaseButton>
				<BaseButton
					variant="ghost"
					:padding="{ x: 5, y: 5 }"
					:aria-label="'Ниже: ' + item.title"
					:is-disabled="index === tasks.length - 1"
					@click="moveBy(item.id, 1)">
					<BaseIcon name="chevron-down" />
				</BaseButton>
				<BaseButton variant="ghost" :padding="{ x: 5, y: 5 }" :aria-label="'Удалить: ' + item.title" @click="remove(item.id)">
					<BaseIcon name="trash" />
				</BaseButton>
			</template>
		</BaseList>
	</div>
`

export const WithActions: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `actions` (только в режиме `none`: у `option` не может быть интерактивного содержимого) — кнопки строки.',
					'Клик и клавиши на кнопках не открывают и не берут строку. «Выше» и «Ниже» вызывают `moveItem(id, index)`',
					'через `ref` — перестановка одним нажатием, без перетаскивания (WCAG 2.5.7), с тем же объявлением и `can-move`.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseButton', 'BaseIcon', 'BaseList', 'type BaseListExpose', 'type ListItem'],
				vue: ['ref', 'useTemplateRef'],
				script: scriptSource(setupSource),
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseButton, BaseIcon, BaseList },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Ниже: Макет главной' }))
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Строка «Макет главной» на месте 2 из 3'))
		await expect(listTitles(canvasElement)).toEqual(['Метод выгрузки', 'Макет главной', 'Тесты оплаты'])
		canvas.getByRole('button', { name: 'Удалить: Тесты оплаты' }).focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(listTitles(canvasElement)).toEqual(['Метод выгрузки', 'Макет главной']))
	},
}
