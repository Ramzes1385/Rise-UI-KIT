import { ref } from 'vue'
import type meta from '../BaseRadio.stories'
import { DELIVERY_OPTIONS } from '../shared'
import BaseRadio from '../../ui/BaseRadio.vue'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Отключённые опции: `isDisabled` у отдельной опции или у всех опций сразу (у группы своего `isDisabled` нет).',
					'Отключённая опция приглушена, не выбирается и пропускается стрелками.',
				].join('\n'),
			},
		},
		controls: { include: ['variant', 'sizeScale', 'isVertical'] },
	},
	render: args => ({
		components: { BaseRadio },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'name', 'label', 'options', 'onUpdate:modelValue']),
			someDisabled: DELIVERY_OPTIONS.map(option => ({ ...option, isDisabled: option.value === 'post' })),
			allDisabled: DELIVERY_OPTIONS.map(option => ({ ...option, isDisabled: true })),
			partial: ref<string | number>('courier'),
			all: ref<string | number>('pickup'),
		}),
		template: `
			<div class="story-stack">
				<BaseRadio v-bind="props" v-model="partial" :options="someDisabled" name="delivery-partial" label="Почта временно недоступна" />
				<BaseRadio v-bind="props" v-model="all" :options="allDisabled" name="delivery-all" label="Доставка выбрана менеджером" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [partialGroup, allGroup] = canvas.getAllByRole('radiogroup')
		await expect(within(partialGroup).getByRole('radio', { name: 'Почтой России' })).toBeDisabled()
		await expect(within(partialGroup).getByRole('radio', { name: 'Курьером' })).toBeEnabled()
		for (const radio of within(allGroup).getAllByRole('radio')) {
			await expect(radio).toBeDisabled()
		}
	},
}
