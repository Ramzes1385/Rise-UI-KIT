import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../../BaseEditor.stories'
import { expect, waitFor, within } from 'storybook/test'
import BaseEditor from '../../../../../ui/BaseEditor.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { html: '<p>Начало. </p>' }

const template = `
	<BaseEditor v-bind="args" v-model="html" label="Заметка" />
`

function paste(target: HTMLElement, data: Record<string, string>): InputEvent {
	const dataTransfer = new DataTransfer()
	Object.entries(data).forEach(([type, value]) => dataTransfer.setData(type, value))
	const event = new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertFromPaste', dataTransfer })
	target.dispatchEvent(event)
	return event
}

function caretAtEnd(textbox: HTMLElement): void {
	const text = textbox.querySelector('p')?.lastChild as Text
	window.getSelection()?.setBaseAndExtent(text, text.data.length, text, text.data.length)
}

export const EditorPaste: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['modelValue'] },
		docs: {
			description: {
				story: [
					'Вставка из буфера обмена и перетаскивание HTML идут через событие `beforeinput` (`insertFromPaste`, `insertFromDrop`):',
					'редактор сам очищает разметку (скрипты, обработчики событий, чужие стили) и кладёт её на место каретки через Selection и Range,',
					'без `document.execCommand`. Простой текст вставляется экранированным, переводы строк становятся `<br>`.',
					'Блоки (`<p>`, списки, `<hr>`) разрезают текущий абзац, текст и встроенные теги остаются в строке. Ctrl/⌘+Z отменяет вставку.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEditor'], state, omit: ['toolbar'] }),
		},
	},
	args: { modelValue: state.html },
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, { state, slots: ['toolbar', 'modelValue'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Заметка' })
		textbox.focus()
		caretAtEnd(textbox)

		const html = paste(textbox, { 'text/html': '<b onclick="alert(1)">жирный</b> и <script>alert(1)</script>обычный текст' })
		await expect(html.defaultPrevented).toBe(true)
		await waitFor(() => expect(within(textbox).getByText('жирный')).toBeVisible())
		await expect(textbox.querySelector('script')).toBeNull()
		await expect(textbox.querySelector('[onclick]')).toBeNull()
		await expect(textbox.querySelector('p')).toHaveTextContent('Начало. жирный и обычный текст')

		paste(textbox, { 'text/plain': 'первая <строка>\nвторая строка' })
		await waitFor(() => expect(textbox.querySelector('br')).not.toBeNull())
		await expect(textbox.querySelector('p')).toHaveTextContent('первая <строка>вторая строка')

		paste(textbox, { 'text/html': '<p>Новый абзац</p>' })
		await waitFor(() => expect(textbox.querySelectorAll('p')).toHaveLength(2))
	},
}
