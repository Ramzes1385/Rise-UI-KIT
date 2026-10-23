import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'
import BaseDadataInput from '../../../ui/BaseDadataInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { demoSource, DEMO_DELAY, PRECISE_ADDRESSES } from '../../shared'

const models = { address: 'modelValue', chosen: 'suggestion' }

const source = demoSource('address', DEMO_DELAY, PRECISE_ADDRESSES)

const template = `
	<div class="story-narrow story-stack" style="min-height: 360px">
		<BaseDadataInput v-bind="args" v-model="address" v-model:suggestion="chosen" />
		<span class="story-label">{{ chosen ? 'Квартира: ' + chosen.data.flat : 'Квартира не выбрана' }}</span>
	</div>
`

export const AddressPrecision: StoryObj<typeof meta> = {
	args: { kind: 'address', label: 'Адрес', placeholder: 'Город, улица, дом, квартира', precision: 'flat', source },
	parameters: {
		docs: {
			description: {
				story: [
					'Адрес до квартиры (`precision="flat"`): подсказка улицы или дома не подтверждает адрес — в поле её текст с',
					'пробелом и новый поиск, допишите дом и квартиру. Ушли из поля без квартиры — «Укажите квартиру». Уровни — `city`,',
					'`street`, `house`, `flat`; проверяются по полям `data` подсказки (`city`/`settlement`, `street`, `house`, `flat`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseDadataInput'],
				models,
				types: { chosen: 'DadataSuggestion | null' },
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['type DadataSuggestion'] },
			}),
		},
	},
	render: args => ({
		components: { BaseDadataInput },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Адрес' })
		await userEvent.type(field, 'тверская')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]').length).toBeGreaterThan(1), { timeout: DEMO_DELAY * 10 })
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(field).toHaveValue('г Москва, ул Тверская ')
		await expect(canvas.getByText('Квартира не выбрана')).toBeVisible()

		await userEvent.type(field, '7, кв 2')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(1), { timeout: DEMO_DELAY * 10 })
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(field).toHaveValue('г Москва, ул Тверская, д 7, кв 2')
		await expect(canvas.getByText('Квартира: 2')).toBeVisible()
	},
}
