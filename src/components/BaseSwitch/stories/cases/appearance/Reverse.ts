import { expect } from 'storybook/test'
import type meta from '../../BaseSwitch.stories'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { settings: { email: true, push: false, digest: true } }

const template = `
	<div class="story-stack story-narrow">
		<BaseSwitch v-bind="args" v-model="settings.email" reverse label="Письма о заказах" />
		<BaseSwitch v-bind="args" v-model="settings.push" reverse label="Push-уведомления" />
		<BaseSwitch v-bind="args" v-model="settings.digest" reverse label="Еженедельная подборка" />
	</div>
`

export const Reverse: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Список настроек: `reverse` ставит подпись слева, трек прижимается к правому краю контейнера.' },
			source: storySource({
				template,
				imports: ['BaseSwitch'],
				state,
				omit: ['default', 'modelValue', 'label', 'reverse', 'onUpdate:modelValue'],
			}),
		},
		controls: { include: ['variant', 'sizeScale', 'isDisabled'] },
	},
	render: args => ({
		components: { BaseSwitch },
		setup: useStorySetup(args, { state, slots: ['default', 'modelValue', 'label', 'reverse', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const toggle = canvas.getByRole('switch', { name: 'Письма о заказах' })
		const label = canvas.getByText('Письма о заказах')
		await expect(toggle.getBoundingClientRect().left).toBeGreaterThan(label.getBoundingClientRect().right)
	},
}
