import type meta from '../../BaseModal.stories'
import BaseModal from '../../../ui/BaseModal.vue'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, waitFor, expect } from 'storybook/test'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const OWN_ARGS = ['default', 'isOpen', 'title', 'onUpdate:isOpen']

const languages = [
	{ value: 'ru', label: 'Русский' },
	{ value: 'en', label: 'Английский' },
	{ value: 'ja', label: 'Японский' },
]

const state = { isOpen: true, language: 'ru' }

const template = `
	<BaseButton variant="outline" @click="isOpen = true">Настройки субтитров</BaseButton>
	<BaseModal v-bind="args" v-model:is-open="isOpen" title="Субтитры серии">
		<BaseSelect v-model="language" label="Язык субтитров" :options="languages" />
		<template #footer>
			<BaseButton variant="outline" @click="isOpen = false">Отмена</BaseButton>
			<BaseButton @click="isOpen = false">Сохранить</BaseButton>
		</template>
	</BaseModal>
`

export const WithList: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Список в окне: Escape сначала закрывает открытый список, следующее нажатие — окно. Список телепортирован в body,',
					'и выбор пункта не считается кликом по подложке.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseModal', 'BaseButton', 'BaseSelect'],
				script: `const languages = ${literal(languages)}`,
				state,
				omit: OWN_ARGS,
			}),
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseModal, BaseButton, BaseSelect },
		setup: useStorySetup(args, { state, data: { languages }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ userEvent }) => {
		const dialog = await screen.findByRole('dialog', { name: 'Субтитры серии' })
		await userEvent.click(within(dialog).getByRole('combobox', { name: 'Язык субтитров' }))
		await userEvent.click(await screen.findByRole('option', { name: 'Японский' }))
		await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
		await expect(within(dialog).getByRole('combobox', { name: 'Язык субтитров' })).toHaveTextContent('Японский')

		await userEvent.click(within(dialog).getByRole('combobox', { name: 'Язык субтитров' }))
		await screen.findByRole('listbox')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
		await expect(screen.getByRole('dialog', { name: 'Субтитры серии' })).toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}
