import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { inlineKey, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { html: 'modelValue' }

const template = `
	<BaseEditor v-bind="args" v-model="html" />
`

export const EditorToolbarKeyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Панель инструментов по APG (toolbar): в порядке Tab одна остановка, внутри панели — стрелки влево и вправо, Home и End.',
					'Tab из панели переходит в текст, Shift+Tab возвращает на последнюю кнопку. Изображение и видео добавляются кнопками,',
					'а размер и удаление выделенного медиа открывает кнопка «Размер и удаление медиа» или Shift+F10 в тексте.',
					'Enter вставляет абзац, Shift+Enter — перенос строки.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEditor'], models, omit: ['toolbar'] }),
		},
	},
	tags: ['!autodocs'],
	args: { modelValue: '<p>Первый абзац</p>' },
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, { models, slots: ['toolbar'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const toolbar = canvas.getByRole('toolbar', { name: 'Форматирование' })
		const stops = Array.from(toolbar.querySelectorAll<HTMLElement>('button, [role="combobox"]')).filter(
			item => item.getAttribute('tabindex') === '0',
		)
		await expect(stops).toHaveLength(1)

		await userEvent.tab()
		const undo = within(toolbar).getByRole('button', { name: 'Отменить' })
		await expect(undo).toHaveFocus()
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await expect(within(toolbar).getByRole('button', { name: 'Повторить' })).toHaveFocus()
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		const bold = within(toolbar).getByRole('button', { name: 'Жирный' })
		await expect(bold).toHaveFocus()
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await expect(within(toolbar).getByRole('button', { name: 'Курсив' })).toHaveFocus()
		await userEvent.keyboard('{End}')
		await expect(within(toolbar).getByRole('button', { name: 'Режим кода' })).toHaveFocus()
		await userEvent.keyboard('{Home}')
		await expect(undo).toHaveFocus()
		await userEvent.keyboard(inlineKey('{ArrowRight}').repeat(3))

		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await userEvent.tab()
		await expect(textbox).toHaveFocus()
		await userEvent.tab({ shift: true })
		await expect(within(toolbar).getByRole('button', { name: 'Курсив' })).toHaveFocus()

		await expect(within(toolbar).getByRole('button', { name: 'Размер и удаление медиа' })).toHaveAttribute('aria-disabled', 'true')

		await tabTo(textbox, userEvent, 3)
		window.getSelection()?.selectAllChildren(textbox)
		window.getSelection()?.collapseToEnd()
		await userEvent.keyboard('{Enter}Второй абзац{Shift>}{Enter}{/Shift}после переноса')
		await waitFor(() => expect(textbox.querySelectorAll('p')).toHaveLength(2))
		await expect(textbox.querySelectorAll('p')[1]!.querySelector('br')).not.toBeNull()
	},
}
