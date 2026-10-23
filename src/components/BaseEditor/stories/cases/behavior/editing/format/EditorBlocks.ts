import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../../BaseEditor.stories'
import { expect, waitFor, within } from 'storybook/test'
import BaseEditor from '../../../../../ui/BaseEditor.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { html: 'modelValue' }
const state = { sent: 0 }

const template = `
	<div class="story-medium story-stack">
		<BaseEditor v-bind="args" v-model="html" label="Заметка" @update:model-value="sent += 1" />
		<span class="story-label">Отправлено значений: {{ sent }}</span>
	</div>
`

function selectAllText(textbox: HTMLElement): void {
	window.getSelection()?.selectAllChildren(textbox)
	textbox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }))
}

export const EditorBlocks: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['modelValue'] },
		docs: {
			description: {
				story: [
					'Блоки, списки и выравнивание применяются через Selection и Range, без `document.execCommand`. Списки: выделенные абзацы',
					'становятся пунктами одного списка, повторное нажатие возвращает абзацы; выравнивание задаёт `text-align` у блоков выделения;',
					'«Цитата» и «Блок кода» включаются и выключаются. Enter делит абзац, добавляет пункт списка, пустой пункт или пустая цитата',
					'завершают список и цитату; Shift+Enter ставит перенос строки. Ctrl/⌘+Z отменяет каждую команду.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEditor'], models, state, omit: ['toolbar'] }),
		},
	},
	args: { modelValue: '<p>Первый</p><p>Второй</p><p>Третий</p>' },
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, { models, state, slots: ['toolbar'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Заметка' })
		textbox.focus()
		selectAllText(textbox)

		await userEvent.click(canvas.getByRole('button', { name: 'Маркированный список' }))
		await waitFor(() => expect(textbox.querySelectorAll('ul > li')).toHaveLength(3))

		await userEvent.click(canvas.getByRole('button', { name: 'По центру' }))
		await waitFor(() => expect(textbox.querySelector('li')).toHaveStyle({ textAlign: 'center' }))

		await userEvent.keyboard('{Control>}z{/Control}')
		await waitFor(() => expect(textbox.querySelector('li')).not.toHaveStyle({ textAlign: 'center' }))
		await userEvent.keyboard('{Control>}z{/Control}')
		await waitFor(() => expect(textbox.querySelector('ul')).toBeNull())

		window.getSelection()?.selectAllChildren(textbox.querySelectorAll('p')[2])
		window.getSelection()?.collapseToEnd()
		await userEvent.click(canvas.getByRole('button', { name: 'Нумерованный список' }))
		await waitFor(() => expect(within(textbox).getAllByRole('listitem')).toHaveLength(1))
		await userEvent.keyboard('{Enter}Четвёртый')
		await waitFor(() => expect(textbox.querySelectorAll('ol > li')).toHaveLength(2))
		await userEvent.keyboard('{Enter}{Enter}')
		await waitFor(() => expect(textbox.querySelectorAll('ol > li')).toHaveLength(2))
		await expect(textbox.lastElementChild?.tagName).toBe('P')
	},
}
