import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'
import { demoSource, DEMO_DELAY } from '../../shared'
import BaseDadataInput from '../../../ui/BaseDadataInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { company: 'modelValue' }

const template = `
	<div class="story-narrow" style="min-height: 280px"><BaseDadataInput v-bind="args" v-model="company" /></div>
`

export const InnDigits: StoryObj<typeof meta> = {
	args: { kind: 'party', label: 'Организация', placeholder: 'Название, ИНН или ОГРН', source: demoSource('party') },
	parameters: {
		docs: {
			description: {
				story: [
					'ИНН цифрами: запрос из 10 или 12 цифр проверяется как ИНН, из 13 или 15 — как ОГРН, у банка 9 цифр — как БИК.',
					'Неверное контрольное число — строка ошибки в списке, и запрос к DaData не уходит (бережёт лимит ключа).',
					'Попробуйте «7707083894», затем «7707083893».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDadataInput'], models }),
		},
	},
	render: args => ({
		components: { BaseDadataInput },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Организация' })
		await userEvent.type(field, '7707083894')
		await waitFor(() => expect(document.querySelector('.base-autocomplete__empty')).toHaveTextContent('Неверное контрольное число ИНН'))
		await expect(document.querySelectorAll('[role="option"]')).toHaveLength(0)

		await userEvent.clear(field)
		await userEvent.type(field, '7707083893')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(1), { timeout: DEMO_DELAY * 10 })
		await expect(document.querySelector('[role="option"]')).toHaveTextContent('ПАО СБЕРБАНК')
	},
}
