import { expect } from 'storybook/test'
import type meta from '../../BaseSwitch.stories'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { off: false, on: true }

const template = `
	<div class="story-col">
		<BaseSwitch v-bind="args" v-model="off" label="Резервное копирование (недоступно на тарифе)" is-disabled />
		<BaseSwitch v-bind="args" v-model="on" label="Двухфакторный вход (включено администратором)" is-disabled />
	</div>
`

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Отключённый переключатель — в обоих состояниях: приглушён, не получает фокус, клик не меняет значение.',
			},
			source: storySource({
				template,
				imports: ['BaseSwitch'],
				state,
				omit: ['default', 'modelValue', 'label', 'isDisabled', 'onUpdate:modelValue'],
			}),
		},
		controls: { include: ['variant', 'sizeScale', 'reverse'] },
	},
	render: args => ({
		components: { BaseSwitch },
		setup: useStorySetup(args, { state, slots: ['default', 'modelValue', 'label', 'isDisabled', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('switch', { name: 'Резервное копирование (недоступно на тарифе)' })
		await expect(toggle).toBeDisabled()
		await userEvent.click(canvas.getByText('Резервное копирование (недоступно на тарифе)'))
		await expect(toggle).not.toBeChecked()
	},
}
