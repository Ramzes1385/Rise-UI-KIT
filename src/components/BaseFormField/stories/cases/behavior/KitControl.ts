import { expect } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import type meta from '../../BaseFormField.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFormField from '../../../ui/BaseFormField.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { email: '' }

const template = `
	<div class="story-narrow">
		<BaseFormField v-bind="args">
			<BaseInput v-model="email" type="email" placeholder="name@example.com" :input-attrs="{ name: 'email', autocomplete: 'email' }" />
		</BaseFormField>
	</div>
`

export const KitControl: StoryObj<typeof meta> = {
	args: { label: 'E-mail', description: 'Пришлём чек на эту почту', isRequired: true },
	parameters: {
		docs: {
			description: {
				story: [
					'Контрол кита внутри: BaseInput, BaseTextarea, BaseSelect и BaseCheckboxGroup сами сообщают обёртке свой id — `for`',
					'не нужен. Подпись обёртки — имя поля, описание или ошибка — его описание, `isRequired` — `aria-required`,',
					'ошибка обёртки красит поле. Ошибку из проверки BaseForm по схеме обёртка берёт по `name`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFormField', 'BaseInput'], state }),
		},
		controls: { include: ['variant', 'sizeScale', 'error', 'description', 'isRequired'] },
	},
	render: args => ({
		components: { BaseFormField, BaseInput },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const input = canvas.getByRole('textbox', { name: 'E-mail' })
		await expect(input).toHaveAccessibleDescription('Пришлём чек на эту почту')
		await expect(input).toHaveAttribute('aria-required', 'true')
		await expect(input).toHaveAttribute('autocomplete', 'email')
		await userEvent.click(canvas.getByText('E-mail'))
		await expect(input).toHaveFocus()
		await expect(canvas.queryByRole('group')).toBeNull()
	},
}
