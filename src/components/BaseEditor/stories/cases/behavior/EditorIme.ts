import { expect, within } from 'storybook/test'
import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { html: 'modelValue' }
const state = { sent: 0 }

const template = `
	<div class="story-medium story-stack">
		<BaseEditor v-bind="args" v-model="html" label="Заметка" @update:model-value="sent += 1" />
		<span class="story-label">Отправлено значений: {{ sent }}</span>
	</div>
`

const compose = (target: HTMLElement, type: 'compositionstart' | 'compositionend'): void => {
	target.dispatchEvent(new CompositionEvent(type, { bubbles: true }))
}

const typeInto = (target: HTMLElement, html: string): void => {
	target.innerHTML = html
	target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertCompositionText' }))
}

export const EditorIme: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['modelValue'] },
		docs: {
			description: {
				story: [
					'Ввод через IME (китайский, японский, корейский): между `compositionstart` и `compositionend` редактор не отправляет',
					'промежуточные значения, не обрабатывает Enter и не перезаписывает содержимое, даже если родитель прислал новое значение.',
					'Итог уходит один раз, когда композиция закончилась. Счётчик под полем показывает число отправленных значений.',
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
	play: async ({ canvas }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Заметка' })
		compose(textbox, 'compositionstart')
		typeInto(textbox, 'に')
		typeInto(textbox, 'にほ')
		await expect(canvas.getByText('Отправлено значений: 0')).toBeVisible()
		await expect(textbox).not.toHaveClass('base-editor__content--empty')

		typeInto(textbox, 'にほん')
		compose(textbox, 'compositionend')
		await expect(canvas.getByText('Отправлено значений: 1')).toBeVisible()
		await expect(within(textbox).getByText('にほん')).toBeVisible()
	},
}
