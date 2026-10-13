import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFileManager.stories'
import { tabTo, storySource } from '@/stories/helpers'
import { expect, screen, waitFor, within } from 'storybook/test'
import { type ManagerCaseOptions, managerRender, managerSource, managerTag } from '../../shared'

const options: ManagerCaseOptions = {
	template: `
${managerTag()}
`,
}

const source = storySource(managerSource(options))

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'view'] },
		docs: {
			description: {
				story: [
					'Клавиатура: список записей — одна остановка Tab (roving tabindex). Стрелки двигают фокус и выбор, Home и End — к краям, в плитках вправо и влево идут по записи, вверх и вниз — по ряду.',
					'Enter открывает папку и переносит фокус в её первую запись, Backspace поднимается выше, F2 переименовывает (Escape отменяет), Delete спрашивает подтверждение,',
					'набор букв ведёт к записи с таким началом имени, Пробел переключает выбор, Ctrl+A выбирает всё, Escape снимает выбор.',
				].join('\n'),
			},
			source,
		},
	},
	tags: ['!autodocs'],
	render: managerRender(options),
	play: async ({ canvas, userEvent }) => {
		const option = (name: RegExp) => canvas.getByRole('option', { name })

		await tabTo(option(/^Архив/), userEvent, 40)
		await userEvent.keyboard('{ArrowDown}')
		await expect(option(/^Документы/)).toHaveFocus()
		await expect(option(/^Документы/)).toHaveAttribute('aria-selected', 'true')
		await userEvent.keyboard('{End}')
		await expect(canvas.getAllByRole('option').at(-1)).toHaveFocus()
		await userEvent.keyboard('{Home}')
		await expect(option(/^Архив/)).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(await canvas.findByRole('listbox', { name: 'Содержимое папки «Документы»' })).toBeVisible()
		await waitFor(() => expect(option(/^Договоры/)).toHaveFocus())
		await userEvent.keyboard('{Backspace}')
		await expect(await canvas.findByRole('listbox', { name: 'Содержимое папки «Файлы»' })).toBeVisible()

		const tabbable = canvas.getAllByRole('option').find(item => item.tabIndex === 0) as HTMLElement
		await tabTo(tabbable, userEvent, 60)
		await userEvent.keyboard('Ф')
		await expect(option(/^Фото/)).toHaveFocus()

		await userEvent.keyboard('{F2}')
		const editor = within(await canvas.findByRole('group', { name: 'Новое имя для «Фото»' })).getByRole('textbox')
		await waitFor(() => expect(editor).toHaveFocus())
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(option(/^Фото/)).toHaveFocus())

		await userEvent.keyboard('{Delete}')
		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить «Фото»?' })
		await waitFor(() => expect(dialog).toBeVisible())
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
		await expect(option(/^Фото/)).toBeVisible()
	},
}
