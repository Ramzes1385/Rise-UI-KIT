import { expect } from 'storybook/test'
import type meta from '../../BaseTagGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTagGroup from '../../../ui/BaseTagGroup.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const plans = [
	{ value: 'free', label: 'Бесплатный' },
	{ value: 'pro', label: 'Pro' },
	{ value: 'team', label: 'Команда', isDisabled: true },
]

const models = { selected: 'modelValue' }

const template = `<BaseTagGroup v-bind="args" v-model="selected" :items="plans" />`

export const Disabled: StoryObj<typeof meta> = {
	args: { selectionMode: 'single', modelValue: 'free', label: 'Тариф' },
	parameters: {
		controls: { include: ['isDisabled', 'variant', 'tone', 'sizeScale'] },
		docs: {
			description: {
				story: 'Выключенная метка (`items[].isDisabled`) не выбирается и пропускается клавишей Tab; `isDisabled` группы выключает все метки.',
			},
			source: storySource({
				template,
				imports: ['BaseTagGroup'],
				models,
				script: `const plans = ${literal(plans)}`,
				omit: ['items'],
				types: { selected: 'TagGroupModelValue' },
			}),
		},
	},
	render: args => ({
		components: { BaseTagGroup },
		setup: useStorySetup(args, { models, data: { plans }, slots: ['tag'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('button', { name: 'Команда' })).toBeDisabled()
		await userEvent.tab()
		await userEvent.tab()
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Команда' })).not.toHaveFocus()
	},
}
