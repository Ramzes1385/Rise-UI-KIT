import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { html: '<h2>Заголовок раздела</h2><p>Обычный абзац под заголовком.</p><blockquote>Цитата из источника.</blockquote>' }

const template = `
	<BaseEditor v-bind="args" v-model="html" label="Статья" />
`

function placeCaret(node: Node): void {
	const range = document.createRange()
	range.setStart(node, 2)
	range.collapse(true)
	window.getSelection()?.removeAllRanges()
	window.getSelection()?.addRange(range)
}

export const EditorFormatSync: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['modelValue'] },
		docs: {
			description: {
				story: [
					'Селект «Формат» на панели следует за кареткой: в заголовке показывает «Заголовок 2», в абзаце — «Параграф»,',
					'в цитате и блоке кода значения нет (показан плейсхолдер). Положение каретки отслеживается по `selectionchange`,',
					'не чаще одного обновления за кадр, поэтому перерисовок лишний раз нет.',
				].join(' '),
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
		const textbox = canvas.getByRole('textbox', { name: 'Статья' })
		const toolbar = canvas.getByRole('toolbar')

		placeCaret(within(textbox).getByRole('heading').firstChild as Text)
		await waitFor(() => expect(toolbar).toHaveTextContent('Заголовок 2'))

		placeCaret(textbox.querySelector('p')?.firstChild as Text)
		await waitFor(() => expect(toolbar).toHaveTextContent('Параграф'))

		placeCaret(textbox.querySelector('blockquote')?.firstChild as Text)
		await waitFor(() => expect(toolbar).toHaveTextContent('Формат'))
	},
}
