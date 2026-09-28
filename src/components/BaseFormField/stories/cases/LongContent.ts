import { ref } from 'vue'
import { expect } from 'storybook/test'
import { BasePin } from '@components/BasePin'
import type meta from '../BaseFormField.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFormField from '../../ui/BaseFormField.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинные подпись, описание и ошибка переносятся по словам и не выходят за ширину контейнера (360px).' },
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseFormField, BasePin },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'label', 'description', 'error']),
			smsCode: ref(''),
			cardPin: ref('0000'),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseFormField
					v-bind="props"
					label="Код подтверждения из СМС, отправленного на номер, указанный при оформлении заказа"
					description="Код действует пять минут. Если сообщение не пришло, запросите новый код — предыдущий перестанет работать">
					<BasePin v-model="smsCode" :length="6" />
				</BaseFormField>
				<BaseFormField
					v-bind="props"
					label="PIN-код карты"
					error="PIN-код не может состоять из одинаковых цифр: придумайте комбинацию, которую сложно угадать, например не дату рождения">
					<BasePin v-model="cardPin" type="password" />
				</BaseFormField>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		for (const text of canvasElement.querySelectorAll<HTMLElement>(
			'.base-form-field__label, .base-form-field__description, .base-form-field__error',
		)) {
			await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth)
		}
	},
}
