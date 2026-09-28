import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../BaseFormField.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFormField from '../../ui/BaseFormField.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { BaseCheckbox } from '@components/BaseCheckbox'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ошибка группы: текст ошибки заменяет описание и описывает группу. Типичный случай — «выберите хотя бы один вариант»',
					'для набора чекбоксов, у которых нет общей подписи.',
				].join('\n'),
			},
		},
	},
	args: {
		label: 'Каналы уведомлений',
		description: 'Можно выбрать несколько',
		error: 'Выберите хотя бы один канал',
		isRequired: true,
	},
	render: args => ({
		components: { BaseFormField, BaseCheckbox },
		setup: () => ({ props: useArgsWithoutSlots(args), channels: ref({ email: false, sms: false, push: false }) }),
		template: `
			<div class="story-narrow">
				<BaseFormField v-bind="props">
					<div class="story-col">
						<BaseCheckbox v-model="channels.email" label="Email" />
						<BaseCheckbox v-model="channels.sms" label="SMS" />
						<BaseCheckbox v-model="channels.push" label="Push-уведомления" />
					</div>
				</BaseFormField>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const group = canvas.getByRole('group', { name: /Каналы уведомлений/ })
		await expect(group).toHaveAccessibleDescription('Выберите хотя бы один канал')
		await expect(canvas.queryByText('Можно выбрать несколько')).toBeNull()
	},
}
