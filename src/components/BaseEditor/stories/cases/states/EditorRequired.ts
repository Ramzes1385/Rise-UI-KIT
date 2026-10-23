import { ref } from 'vue'
import type meta from '../../BaseEditor.stories'
import { expect, waitFor } from 'storybook/test'
import BaseEditor from '../../../ui/BaseEditor.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { html: 'modelValue' }

const template = `
	<form class="story-medium story-stack" @submit.prevent="submit">
		<BaseEditor v-bind="args" v-model="html" label="Описание" name="description" is-required />
		<BaseButton type="submit">Отправить</BaseButton>
		<span class="story-label">Отправлено: {{ sent || 'ничего' }}</span>
	</form>
`

const script = `
const sent = ref('')

function submit(event: Event) {
	sent.value = String(new FormData(event.target as HTMLFormElement).get('description'))
}
`

export const EditorRequired: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['modelValue', 'isRequired', 'name', 'label'] },
		docs: {
			description: {
				story: [
					'Обязательное поле формы: `isRequired` ставит `aria-required` и звёздочку у заголовка, пустой редактор (без текста и медиа) после ухода',
					'фокуса показывает «Обязательное поле». `name` добавляет скрытое поле формы с очищенным HTML, поэтому значение попадает в `FormData`',
					'и в отправку нативной `<form>`; у пустого редактора значение — пустая строка.',
				].join(' '),
			},
			source: storySource({ template, imports: ['BaseEditor', 'BaseButton'], models, vue: ['ref'], script, omit: ['toolbar'] }),
		},
	},
	args: { modelValue: '' },
	render: args => ({
		components: { BaseEditor, BaseButton },
		setup: useStorySetup(args, {
			models,
			slots: ['toolbar'],
			setup: () => {
				const sent = ref('')
				function submit(event: Event): void {
					sent.value = String(new FormData(event.target as HTMLFormElement).get('description'))
				}
				return { sent, submit }
			},
		}),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: /Описание/ })
		await expect(textbox).toHaveAttribute('aria-required', 'true')

		await userEvent.click(textbox)
		await userEvent.tab()
		await waitFor(() => expect(canvas.getByText('Обязательное поле')).toBeVisible())

		await userEvent.click(textbox)
		await userEvent.keyboard('Готово')
		await waitFor(() => expect(canvas.queryByText('Обязательное поле')).toBeNull())

		await userEvent.click(canvas.getByRole('button', { name: 'Отправить' }))
		await expect(canvas.getByText(/^Отправлено: .*Готово/)).toBeVisible()
	},
}
