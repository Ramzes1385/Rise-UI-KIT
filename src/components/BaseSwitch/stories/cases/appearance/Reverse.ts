import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../../BaseSwitch.stories'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Reverse: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Список настроек: `reverse` ставит подпись слева, трек прижимается к правому краю контейнера.' } },
		controls: { include: ['variant', 'sizeScale', 'isDisabled'] },
	},
	render: args => ({
		components: { BaseSwitch },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'reverse', 'onUpdate:modelValue']),
			settings: ref({ email: true, push: false, digest: true }),
		}),
		template: `
			<div class="story-stack story-narrow">
				<BaseSwitch v-bind="props" v-model="settings.email" reverse label="Письма о заказах" />
				<BaseSwitch v-bind="props" v-model="settings.push" reverse label="Push-уведомления" />
				<BaseSwitch v-bind="props" v-model="settings.digest" reverse label="Еженедельная подборка" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const toggle = canvas.getByRole('switch', { name: 'Письма о заказах' })
		const label = canvas.getByText('Письма о заказах')
		await expect(toggle.getBoundingClientRect().left).toBeGreaterThan(label.getBoundingClientRect().right)
	},
}
