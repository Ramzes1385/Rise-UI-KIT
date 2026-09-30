import type meta from '../../BaseRadio.stories'
import { DELIVERY_OPTIONS } from '../../shared'
import { expect, within } from 'storybook/test'
import BaseRadio from '../../../ui/BaseRadio.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const someDisabled = DELIVERY_OPTIONS.map(option => ({ ...option, isDisabled: option.value === 'post' }))

const allDisabled = DELIVERY_OPTIONS.map(option => ({ ...option, isDisabled: true }))

const state = { partial: 'courier', all: 'pickup' }

const template = `
	<div class="story-stack">
		<BaseRadio v-bind="args" v-model="partial" :options="someDisabled" name="delivery-partial" label="Почта временно недоступна" />
		<BaseRadio v-bind="args" v-model="all" :options="allDisabled" name="delivery-all" label="Доставка выбрана менеджером" />
	</div>
`

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Отключённые опции: `isDisabled` у отдельной опции или у всех опций сразу (у группы своего `isDisabled` нет).',
					'Отключённая опция приглушена, не выбирается и пропускается стрелками.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseRadio'],
				script: [`const someDisabled = ${literal(someDisabled)}`, `const allDisabled = ${literal(allDisabled)}`].join('\n'),
				state,
				types: { partial: 'string | number', all: 'string | number' },
				omit: ['default', 'modelValue', 'name', 'label', 'options', 'onUpdate:modelValue'],
			}),
		},
		controls: { include: ['variant', 'sizeScale', 'isVertical'] },
	},
	render: args => ({
		components: { BaseRadio },
		setup: useStorySetup(args, {
			state,
			data: { someDisabled, allDisabled },
			slots: ['default', 'modelValue', 'name', 'label', 'options', 'onUpdate:modelValue'],
		}),
		template,
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
