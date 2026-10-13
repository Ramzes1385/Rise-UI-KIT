import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = {
	html: '<p>Документация лежит <a href="https://example.com/old">по этому адресу</a>, а выделенное слово станет ссылкой.</p>',
}

const template = `
	<BaseEditor v-bind="args" v-model="html" label="Заметка" />
`

export const EditorLinkDialog: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['modelValue'] },
		docs: {
			description: {
				story: [
					'Кнопка «Ссылка» (или Ctrl/⌘+K) открывает диалог у выделения вместо `window.prompt`: адрес, «Открыть в новой вкладке»,',
					'«Применить» (Enter), «Удалить ссылку» (если выделение внутри ссылки). Адрес проверяется: допустимы http, https, mailto, tel',
					'и относительные ссылки, `example.com` дополняется до `https://`. Escape закрывает диалог, фокус и выделение возвращаются в редактор.',
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
	play: async ({ canvas, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Заметка' })
		const link = within(textbox).getByRole('link')
		const range = document.createRange()
		range.setStart(link.firstChild as Text, 3)
		range.setEnd(link.firstChild as Text, 8)
		window.getSelection()?.removeAllRanges()
		window.getSelection()?.addRange(range)
		textbox.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }))

		await userEvent.click(canvas.getByRole('button', { name: 'Ссылка' }))
		const dialog = await within(document.body).findByRole('dialog', { name: 'Ссылка' })
		const input = within(dialog).getByLabelText('Адрес ссылки')
		await waitFor(() => expect(input).toHaveFocus())
		await expect(input).toHaveValue('https://example.com/old')

		await userEvent.clear(input)
		await userEvent.type(input, 'javascript:alert(1){Enter}')
		await expect(await within(dialog).findByText('Введите адрес: http, https, mailto или tel')).toBeVisible()

		await userEvent.clear(input)
		await userEvent.type(input, 'example.com/new')
		await userEvent.click(within(dialog).getByRole('checkbox', { name: 'Открыть в новой вкладке' }))
		await userEvent.click(within(dialog).getByRole('button', { name: 'Применить' }))

		await waitFor(() => expect(within(textbox).getByRole('link')).toHaveAttribute('href', 'https://example.com/new'))
		await expect(within(textbox).getByRole('link')).toHaveAttribute('target', '_blank')
		await expect(textbox).toHaveFocus()
	},
}
