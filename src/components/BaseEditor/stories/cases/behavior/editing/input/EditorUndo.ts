import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../../BaseEditor.stories'
import { expect, waitFor, within } from 'storybook/test'
import BaseEditor from '../../../../../ui/BaseEditor.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { html: 'modelValue' }

const BOLD_SELECTOR = 'b, strong'
const state = { sent: 0 }

const template = `
	<div class="story-medium story-stack">
		<BaseEditor v-bind="args" v-model="html" label="Заметка" @update:model-value="sent += 1" />
		<span class="story-label">Отправлено значений: {{ sent }}</span>
	</div>
`

function typeInto(target: HTMLElement, html: string): void {
	target.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText' }))
	target.innerHTML = html
	const text = target.querySelector('p')?.firstChild as Text
	window.getSelection()?.setBaseAndExtent(text, text.data.length, text, text.data.length)
	target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }))
}

function selectWord(target: HTMLElement, start: number, end: number): void {
	const text = target.querySelector('p')?.firstChild as Text
	window.getSelection()?.setBaseAndExtent(text, start, text, end)
	target.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'ArrowRight' }))
}

export const EditorUndo: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['modelValue'] },
		docs: {
			description: {
				story: [
					'Отмена и повтор ведёт сам редактор, а не браузер: Ctrl/⌘+Z отменяет, Ctrl/⌘+Shift+Z и Ctrl+Y (кроме macOS) повторяют —',
					'одинаково в Chrome, Firefox и Safari. Каждая команда панели, вставка и перетаскивание — отдельный шаг; набор склеивается',
					'в шаг, пока пауза между правками меньше 500 мс (не больше 20 правок подряд). После отмены выделение возвращается,',
					'и следующая команда применяется к нему же. Внешнее изменение `v-model` очищает историю, режим кода целиком — один шаг.',
					'Кнопки «Отменить» и «Повторить» в начале панели делают то же без клавиатуры (на телефоне и планшете): на краю',
					'истории кнопка получает `aria-disabled`, но сохраняет фокус; в режиме кода кнопки недоступны (у поля своя история).',
					'Скрыть группу можно пропом `hasHistoryButtons`. Через `ref` и слот `toolbar` доступны `undo`, `redo`, `canUndo`, `canRedo`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEditor'], models, state, omit: ['toolbar'] }),
		},
	},
	args: { modelValue: '' },
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, { models, state, slots: ['toolbar'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Заметка' })
		textbox.focus()
		typeInto(textbox, '<p>Привет мир</p>')
		selectWord(textbox, 7, 10)

		await userEvent.click(canvas.getByRole('button', { name: 'Жирный' }))
		await waitFor(() => expect(within(textbox).getByText('мир').closest(BOLD_SELECTOR)).not.toBeNull())

		await userEvent.keyboard('{Control>}z{/Control}')
		await waitFor(() => expect(textbox.querySelector(BOLD_SELECTOR)).toBeNull())
		await expect(textbox).toHaveTextContent('Привет мир')

		await userEvent.keyboard('{Control>}y{/Control}')
		await waitFor(() => expect(textbox.querySelector(BOLD_SELECTOR)).not.toBeNull())

		await userEvent.keyboard('{Control>}z{/Control}')
		await waitFor(() => expect(textbox.querySelector(BOLD_SELECTOR)).toBeNull())
		await userEvent.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')
		await waitFor(() => expect(textbox.querySelector(BOLD_SELECTOR)).not.toBeNull())

		await userEvent.keyboard('{Control>}z{/Control}')
		await userEvent.keyboard('{Control>}z{/Control}')
		await waitFor(() => expect(textbox).toHaveTextContent(/^$/))

		const undoButton = canvas.getByRole('button', { name: 'Отменить' })
		const redoButton = canvas.getByRole('button', { name: 'Повторить' })
		await expect(undoButton).toHaveAttribute('aria-disabled', 'true')
		await expect(redoButton).not.toHaveAttribute('aria-disabled')

		redoButton.focus()
		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(textbox.querySelector(BOLD_SELECTOR)).not.toBeNull())
		await expect(redoButton).toHaveAttribute('aria-disabled', 'true')
		await expect(redoButton).toHaveFocus()

		await userEvent.click(undoButton)
		await waitFor(() => expect(textbox.querySelector(BOLD_SELECTOR)).toBeNull())
		await expect(textbox).toHaveTextContent('Привет мир')
		await expect(redoButton).not.toHaveAttribute('aria-disabled')

		await userEvent.click(redoButton)
		await waitFor(() => expect(textbox.querySelector(BOLD_SELECTOR)).not.toBeNull())
		await expect(redoButton).toHaveAttribute('aria-disabled', 'true')
	},
}
