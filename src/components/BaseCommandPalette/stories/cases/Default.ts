import { ref } from 'vue'
import { BaseKbd } from '@components/BaseKbd'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseCommandPalette.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseCommandPalette from '../../ui/BaseCommandPalette.vue'
import { expect, screen, waitFor, within } from 'storybook/test'
import type { CommandItem } from '../../types/BaseCommandPalette.types'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Нажмите Ctrl+K (⌘K на Mac) или кнопку. Наберите «тем», стрелкой выберите команду, Enter выполнит её.',
			},
		},
	},
	render: args => ({
		components: { BaseCommandPalette, BaseButton, BaseKbd },
		setup() {
			const isOpen = ref(false)
			const last = ref('')
			const handleSelect = (command: CommandItem) => {
				last.value = command.label
			}
			return { props: useArgsWithoutSlots(args), isOpen, last, handleSelect }
		},
		template: `
			<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px">
				<BaseButton variant="outline" @click="isOpen = true">Команды <BaseKbd value="meta" /><BaseKbd value="K" /></BaseButton>
				<p style="margin: 0" aria-live="polite">{{ last ? 'Выполнено: ' + last : 'Команда ещё не выбрана' }}</p>
				<BaseCommandPalette v-bind="props" v-model:is-open="isOpen" @select="handleSelect" />
			</div>`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.keyboard('{Control>}k{/Control}')
		const dialog = await screen.findByRole('dialog', { name: 'Палитра команд' })
		const search = within(dialog).getByRole('combobox', { name: 'Поиск команды' })
		await waitFor(() => expect(search).toHaveFocus())
		await expect(within(dialog).getByRole('option', { name: /Главная/ })).toHaveAttribute('aria-selected', 'true')
		await userEvent.keyboard('тем')
		await expect(within(dialog).getAllByRole('option')).toHaveLength(1)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByText('Выполнено: Переключить тему')).toBeInTheDocument())
		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
	},
}
