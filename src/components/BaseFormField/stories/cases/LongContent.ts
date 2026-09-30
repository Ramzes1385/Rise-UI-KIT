import { expect } from 'storybook/test'
import { BasePin } from '@components/BasePin'
import type meta from '../BaseFormField.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFormField from '../../ui/BaseFormField.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { smsCode: '', cardPin: '0000' }

const template = `
	<div class="story-col story-narrow">
		<BaseFormField
			v-bind="args"
			label="Код подтверждения из СМС, отправленного на номер, указанный при оформлении заказа"
			description="Код действует пять минут. Если сообщение не пришло, запросите новый код — предыдущий перестанет работать">
			<BasePin v-model="smsCode" :length="6" />
		</BaseFormField>
		<BaseFormField
			v-bind="args"
			label="PIN-код карты"
			error="PIN-код не может состоять из одинаковых цифр: придумайте комбинацию, которую сложно угадать, например не дату рождения">
			<BasePin v-model="cardPin" type="password" />
		</BaseFormField>
	</div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинные подпись, описание и ошибка переносятся по словам и не выходят за ширину контейнера (360px).' },
			source: storySource({
				template,
				imports: ['BaseFormField', 'BasePin'],
				state,
				omit: ['default', 'label', 'description', 'error'],
			}),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseFormField, BasePin },
		setup: useStorySetup(args, { state, slots: ['default', 'label', 'description', 'error'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		for (const text of canvasElement.querySelectorAll<HTMLElement>(
			'.base-form-field__label, .base-form-field__description, .base-form-field__error',
		)) {
			await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth)
		}
	},
}
