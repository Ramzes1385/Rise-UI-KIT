import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { screen, within, waitFor, expect } from 'storybook/test'

const HIDDEN_ARGS = ['isOpen', 'onUpdate:isOpen']

const state = { isOpen: false, tag: '' }

const template = `
	<div class="story-row">
		<BaseDropdown v-bind="args" v-model:is-open="isOpen">
			<BaseButton variant="outline" @click="isOpen = !isOpen">
				Метка
				<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
			</BaseButton>
			<template #dropdown>
				<div data-testid="panel" class="story-stack" style="width: 220px;">
					<BaseInput v-model="tag" label="Новая метка" />
					<BaseButton variant="outline" @click="isOpen = false">Добавить</BaseButton>
				</div>
			</template>
		</BaseDropdown>
		<BaseButton variant="ghost">Сохранить задачу</BaseButton>
	</div>
`

export const TabFromPanel: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Tab из панели: панель телепортируется в конец страницы, и Tab с её последнего элемента ушёл бы туда незаметно.',
					'Поэтому Tab, уводящий фокус из панели (и Shift+Tab с первого элемента), закрывает её и возвращает фокус на триггер —',
					'следующий Tab ведёт к элементу после триггера. Внутри панели Tab работает как обычно.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDropdown', 'BaseButton', 'BaseIcon', 'BaseInput'], state, omit: HIDDEN_ARGS }),
		},
		controls: { include: ['variant'] },
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseIcon, BaseInput },
		setup: useStorySetup(args, { state, slots: HIDDEN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Метка' })
		await userEvent.click(trigger)
		const panel = await screen.findByTestId('panel')

		await userEvent.click(within(panel).getByLabelText('Новая метка'))
		await userEvent.tab()
		await expect(within(panel).getByRole('button', { name: 'Добавить' })).toHaveFocus()

		await userEvent.tab()
		await waitFor(() => expect(screen.queryByTestId('panel')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()

		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Сохранить задачу' })).toHaveFocus()
	},
}
