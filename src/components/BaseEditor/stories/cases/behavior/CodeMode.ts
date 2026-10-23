import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { html: '<p>Текст с <strong>жирным</strong> словом.</p>' }

const template = `
	<BaseEditor v-bind="args" v-model="html" />
`

export const CodeMode: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Режим HTML-кода: кнопка «Режим кода» показывает разметку в текстовом поле, правки видны в визуальном режиме',
					'после повторного нажатия. Кнопки тулбара в режиме кода оборачивают выделенный фрагмент в теги.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEditor'], state, omit: ['toolbar'] }),
		},
	},
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, { state, slots: ['toolbar', 'modelValue'] }),
		template,
	}),
	args: { modelValue: state.html },
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Режим кода' })
		await userEvent.click(toggle)
		await expect(toggle).toHaveAttribute('aria-pressed', 'true')

		const code = canvas.getByRole('textbox', { name: 'HTML-код' })
		await expect(code).toHaveValue('<p>Текст с <strong>жирным</strong> словом.</p>')
		await userEvent.clear(code)
		await userEvent.type(code, '<h3>Итоги</h3><p>Все задачи закрыты.</p>')

		await userEvent.click(toggle)
		await expect(toggle).toHaveAttribute('aria-pressed', 'false')
		const textbox = await canvas.findByRole('textbox', { name: 'Текстовый редактор' })
		await waitFor(() => expect(within(textbox).getByRole('heading', { name: 'Итоги' })).toBeVisible())
	},
}
