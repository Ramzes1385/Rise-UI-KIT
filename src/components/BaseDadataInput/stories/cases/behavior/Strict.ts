import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'
import { demoSource, DEMO_DELAY } from '../../shared'
import BaseDadataInput from '../../../ui/BaseDadataInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { address: 'modelValue', chosen: 'suggestion' }

const source = demoSource('address')

const template = `
	<div class="story-narrow story-stack" style="min-height: 320px">
		<BaseDadataInput v-bind="args" v-model="address" v-model:suggestion="chosen" />
		<span class="story-label">{{ chosen ? 'Подтверждено: ' + chosen.value : 'Адрес не выбран из подсказок' }}</span>
	</div>
`

export const Strict: StoryObj<typeof meta> = {
	args: { kind: 'address', label: 'Адрес доставки', placeholder: 'Город, улица, дом', isStrict: true, source },
	parameters: {
		docs: {
			description: {
				story: [
					'Только из подсказок (`isStrict`): свой текст при уходе из поля остаётся, но не подтверждается — под полем',
					'«Выберите вариант из списка», `validate(false)`, `v-model:suggestion` — `null`. Выбор подсказки подтверждает',
					'адрес: `v-model:suggestion` — подсказка целиком (`data` — ФИАС, координаты, дом, квартира), `validate(true)`.',
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
		const field = canvas.getByRole('combobox', { name: 'Адрес доставки' })
		await userEvent.type(field, 'мой адрес')
		await userEvent.tab()
		await expect(field).toHaveValue('мой адрес')
		await waitFor(() => expect(canvas.getByText('Выберите вариант из списка')).toBeVisible())
		await expect(field).toHaveAttribute('aria-invalid', 'true')

		await userEvent.clear(field)
		await userEvent.type(field, 'тверская 7')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(1), { timeout: DEMO_DELAY * 10 })
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(field).toHaveValue('г Москва, ул Тверская, д 7')
		await expect(canvas.getByText('Подтверждено: г Москва, ул Тверская, д 7')).toBeVisible()
		await expect(canvas.queryByText('Выберите вариант из списка')).toBeNull()
	},
}
