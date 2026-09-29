import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../../BaseCheckbox.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCheckbox from '../../../ui/BaseCheckbox.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const ConsentBeforeSubmit: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Согласие перед отправкой: кнопка «Оформить заказ» доступна, только когда чекбокс отмечен.' } },
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseCheckbox, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'label', 'onUpdate:modelValue']), isAgreed: ref(false) }),
		template: `
			<div class="story-col">
				<BaseCheckbox v-bind="props" v-model="isAgreed" label="Принимаю условия доставки и возврата" />
				<BaseButton :is-disabled="!isAgreed">Оформить заказ</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const submit = canvas.getByRole('button', { name: 'Оформить заказ' })
		await expect(submit).toBeDisabled()
		await userEvent.click(canvas.getByRole('checkbox', { name: 'Принимаю условия доставки и возврата' }))
		await expect(submit).toBeEnabled()
	},
}
