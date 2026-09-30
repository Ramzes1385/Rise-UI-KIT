import { expect } from 'storybook/test'
import type meta from '../../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCheckbox from '../../../ui/BaseCheckbox.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { off: false, on: true }

const template = `
	<div class="story-col">
		<BaseCheckbox v-bind="args" v-model="off" label="Резервная копия (недоступно на тарифе)" is-disabled />
		<BaseCheckbox v-bind="args" v-model="on" label="Шифрование (включено администратором)" is-disabled />
	</div>
`

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Отключённый чекбокс — в обоих состояниях: приглушён, не получает фокус, клик не меняет значение.' },
			source: storySource({
				template,
				imports: ['BaseCheckbox'],
				state,
				omit: ['modelValue', 'label', 'isDisabled', 'onUpdate:modelValue'],
			}),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: useStorySetup(args, { state, slots: ['modelValue', 'label', 'isDisabled', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const checkbox = canvas.getByRole('checkbox', { name: 'Резервная копия (недоступно на тарифе)' })
		await expect(checkbox).toBeDisabled()
		await userEvent.click(canvas.getByText('Резервная копия (недоступно на тарифе)'))
		await expect(checkbox).not.toBeChecked()
		await expect(canvas.getByRole('checkbox', { name: 'Шифрование (включено администратором)' })).toBeChecked()
	},
}
