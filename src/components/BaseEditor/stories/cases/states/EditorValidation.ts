import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const models = { html: 'modelValue' }

const LOCKED_HTML = '<p>Отключённый редактор: текст виден, но недоступен для ввода и фокуса.</p>'

const template = `
	<div class="story-medium story-stack">
		<BaseEditor v-bind="args" v-model="html" label="Описание" :error="isBlank(html) ? 'Заполните описание' : ''" />
		<BaseEditor v-bind="args" label="Отключён" is-disabled :model-value="locked" />
	</div>
`

const isBlank = (html: string): boolean => !html.replace(/<[^>]*>/g, '').trim()

export const EditorValidation: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Поле как у остальных контролов кита: `label` называет область текста и переводит в неё фокус по клику,',
					'`error` красит рамку и связывается с областью текста через `aria-invalid` и `aria-describedby`,',
					'`isDisabled` отключает ввод и фокус (так же поступает отключённая BaseForm).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseEditor'],
				models,
				script: `const locked = ${literal(LOCKED_HTML)}\nconst isBlank = (html: string): boolean => !html.replace(/<[^>]*>/g, '').trim()`,
			}),
		},
	},
	args: { modelValue: '' },
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, { models, slots: ['toolbar'], data: { locked: LOCKED_HTML, isBlank } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('textbox', { name: 'Описание' })
		await expect(field).toHaveAttribute('aria-invalid', 'true')
		await expect(field).toHaveAccessibleDescription('Заполните описание')

		await userEvent.click(canvas.getByText('Описание'))
		await expect(field).toHaveFocus()
		await userEvent.keyboard('Готово')
		await waitFor(() => expect(canvas.queryByText('Заполните описание')).toBeNull())
		await expect(field).not.toHaveAttribute('aria-invalid')

		const locked = canvas.getByRole('textbox', { name: 'Отключён' })
		await expect(locked).toHaveAttribute('aria-disabled', 'true')
		await expect(locked).toHaveAttribute('contenteditable', 'false')
		await expect(within(locked).getByText(/Отключённый редактор/)).toBeVisible()
	},
}
