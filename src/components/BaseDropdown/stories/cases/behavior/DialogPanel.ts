import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
import { screen, within, waitFor, expect } from 'storybook/test'
import { tabTo, storySource, useStorySetup } from '@/stories/helpers'

const HIDDEN_ARGS = ['isOpen', 'onUpdate:isOpen', 'trapFocus']

const state = { isOpen: false, from: '01.10.2026', to: '31.10.2026' }

const template = `
	<BaseDropdown v-bind="args" v-model:is-open="isOpen" trap-focus>
		<BaseButton variant="outline" @click="isOpen = !isOpen">
			Период
			<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
		</BaseButton>
		<template #dropdown>
			<div role="dialog" aria-label="Период отчёта" class="story-stack" style="width: 240px;">
				<BaseInput v-model="from" label="С" />
				<BaseInput v-model="to" label="По" />
				<BaseButton @click="isOpen = false">Применить</BaseButton>
			</div>
		</template>
	</BaseDropdown>
`

export const DialogPanel: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Панель-диалог: `trapFocus` (APG Dialog). При открытии фокус переходит в первое поле, Tab и Shift+Tab ходят по кругу',
					'внутри панели, Escape или «Применить» закрывают её и возвращают фокус на кнопку. Содержимому — `role="dialog"` и имя.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDropdown', 'BaseButton', 'BaseIcon', 'BaseInput'], state, omit: HIDDEN_ARGS }),
		},
		controls: { include: ['variant', 'position'] },
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseDropdown, BaseButton, BaseIcon, BaseInput },
		setup: useStorySetup(args, { state, slots: HIDDEN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Период' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')

		const dialog = await screen.findByRole('dialog', { name: 'Период отчёта' })
		const from = within(dialog).getByLabelText('С')
		await waitFor(() => expect(from).toHaveFocus())

		await userEvent.tab()
		await expect(within(dialog).getByLabelText('По')).toHaveFocus()
		await userEvent.tab()
		await expect(within(dialog).getByRole('button', { name: 'Применить' })).toHaveFocus()
		await userEvent.tab()
		await expect(from).toHaveFocus()
		await userEvent.tab({ shift: true })
		await expect(within(dialog).getByRole('button', { name: 'Применить' })).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
