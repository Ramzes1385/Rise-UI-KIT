import type { SearchArgs } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { docsFrame, resultTitles } from '../../shared'
import { screen, waitFor, expect } from 'storybook/test'

export const SidebarMode: StoryObj<SearchArgs> = {
	args: { mode: 'sidebar', modelValue: 'запис' },
	parameters: {
		docs: { ...docsFrame(420), description: { story: 'Режим `sidebar`: окно поиска — панель у правого края экрана во всю высоту.' } },
	},
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		const dialog = await screen.findByRole('dialog', { name: 'Поиск' })
		await waitFor(() => expect(dialog).toBeVisible())
		await expect(resultTitles()).toEqual(['Запись голоса — сцена 12', 'Календарь записей'])
		await expect(args.onSelect).not.toHaveBeenCalled()
	},
}
