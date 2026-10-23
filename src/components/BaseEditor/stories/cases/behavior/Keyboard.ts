import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, within, waitFor } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { html: '<p>Проверка клавиатуры</p>' }

const template = `
	<BaseEditor v-bind="args" v-model="html" />
`

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab входит в тулбар одной остановкой и попадает в текст (видно кольцо фокуса), Shift+Tab возвращает',
					'на последнюю кнопку тулбара. Ctrl+B / Ctrl+I / Ctrl+U (⌘ на macOS) переключают начертание выделенного текста.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEditor'], state, omit: ['toolbar'] }),
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, { state, slots: ['toolbar', 'modelValue'] }),
		template,
	}),
	args: { modelValue: state.html },
	play: async ({ canvas, userEvent }) => {
		const bold = canvas.getByRole('button', { name: 'Жирный' })
		const undo = canvas.getByRole('button', { name: 'Отменить' })
		await userEvent.tab()
		await expect(undo).toHaveFocus()

		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await tabTo(textbox, userEvent, 30)
		await expect(getComputedStyle(textbox.closest('.base-editor__frame') as HTMLElement).boxShadow).not.toBe('none')

		await userEvent.tripleClick(within(textbox).getByText('Проверка клавиатуры'))
		await userEvent.keyboard('{Control>}b{/Control}')
		await waitFor(() => expect(bold).toHaveAttribute('aria-pressed', 'true'))
		await userEvent.keyboard('{Control>}i{/Control}')
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Курсив' })).toHaveAttribute('aria-pressed', 'true'))

		await userEvent.tab({ shift: true })
		await expect(undo).toHaveFocus()
	},
}
