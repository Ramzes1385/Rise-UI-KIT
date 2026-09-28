import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../BaseCheckbox.stories'
import BaseCheckbox from '../../ui/BaseCheckbox.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Отключённый чекбокс — в обоих состояниях: приглушён, не получает фокус, клик не меняет значение.' },
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'label', 'isDisabled', 'onUpdate:modelValue']),
			off: ref(false),
			on: ref(true),
		}),
		template: `
			<div class="story-col">
				<BaseCheckbox v-bind="props" v-model="off" label="Резервная копия (недоступно на тарифе)" is-disabled />
				<BaseCheckbox v-bind="props" v-model="on" label="Шифрование (включено администратором)" is-disabled />
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const checkbox = canvas.getByRole('checkbox', { name: 'Резервная копия (недоступно на тарифе)' })
		await expect(checkbox).toBeDisabled()
		await userEvent.click(canvas.getByText('Резервная копия (недоступно на тарифе)'))
		await expect(checkbox).not.toBeChecked()
		await expect(canvas.getByRole('checkbox', { name: 'Шифрование (включено администратором)' })).toBeChecked()
	},
}
