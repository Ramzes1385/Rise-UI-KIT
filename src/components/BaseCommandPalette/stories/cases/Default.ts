import { ref } from 'vue'
import { BaseKbd } from '@components/BaseKbd'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseCommandPalette.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseCommandPalette from '../../ui/BaseCommandPalette.vue'
import { expect, screen, waitFor, within } from 'storybook/test'
import type { CommandItem } from '../../types/BaseCommandPalette.types'

const state = { isOpen: false }

const template = `
	<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 12px">
		<BaseButton variant="outline" @click="isOpen = true">Команды <BaseKbd value="meta" /><BaseKbd value="K" /></BaseButton>
		<p style="margin: 0" aria-live="polite">{{ last ? 'Выполнено: ' + last : 'Команда ещё не выбрана' }}</p>
		<BaseCommandPalette v-bind="args" v-model:is-open="isOpen" @select="handleSelect" />
	</div>
`

const script = `
const last = ref('')

function handleSelect(command: CommandItem): void {
	last.value = command.label
}
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Нажмите Ctrl+K (⌘K на Mac) или кнопку. Наберите «тем», стрелкой выберите команду, Enter выполнит её.',
			},
			source: storySource({
				template,
				imports: ['BaseCommandPalette', 'BaseButton', 'BaseKbd', 'type CommandItem'],
				state,
				script,
			}),
		},
	},
	render: args => ({
		components: { BaseCommandPalette, BaseButton, BaseKbd },
		setup: useStorySetup(args, {
			state,
			setup: () => {
				const last = ref('')
				const handleSelect = (command: CommandItem): void => {
					last.value = command.label
				}
				return { last, handleSelect }
			},
		}),
		template,
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
