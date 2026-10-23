import { expect } from 'storybook/test'
import type meta from '../../BaseCheckbox.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCheckbox from '../../../ui/BaseCheckbox.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { isAgreed: false }

const template = `
	<div class="story-col">
		<BaseCheckbox v-bind="args" v-model="isAgreed" label="Принимаю условия доставки и возврата" />
		<BaseButton :is-disabled="!isAgreed">Оформить заказ</BaseButton>
	</div>
`

export const ConsentBeforeSubmit: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Согласие перед отправкой: кнопка «Оформить заказ» доступна, только когда чекбокс отмечен.' },
			source: storySource({
				template,
				imports: ['BaseCheckbox', 'BaseButton'],
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseCheckbox, BaseButton },
		setup: useStorySetup(args, { state, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const submit = canvas.getByRole('button', { name: 'Оформить заказ' })
		await expect(submit).toBeDisabled()
		await userEvent.click(canvas.getByRole('checkbox', { name: 'Принимаю условия доставки и возврата' }))
		await expect(submit).toBeEnabled()
	},
}
