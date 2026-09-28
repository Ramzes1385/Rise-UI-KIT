import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../BaseSwitch.stories'
import BaseSwitch from '../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Отключённый переключатель — в обоих состояниях: приглушён, не получает фокус, клик не меняет значение.',
			},
		},
		controls: { include: ['variant', 'sizeScale', 'reverse'] },
	},
	render: args => ({
		components: { BaseSwitch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'isDisabled', 'onUpdate:modelValue']),
			off: ref(false),
			on: ref(true),
		}),
		template: `
			<div class="story-col">
				<BaseSwitch v-bind="props" v-model="off" label="Резервное копирование (недоступно на тарифе)" is-disabled />
				<BaseSwitch v-bind="props" v-model="on" label="Двухфакторный вход (включено администратором)" is-disabled />
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('switch', { name: 'Резервное копирование (недоступно на тарифе)' })
		await expect(toggle).toBeDisabled()
		await userEvent.click(canvas.getByText('Резервное копирование (недоступно на тарифе)'))
		await expect(toggle).not.toBeChecked()
	},
}
