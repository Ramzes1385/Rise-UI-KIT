import { CENTERED } from '../../shared'
import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorPicker.stories'
import BaseColorPicker from '../../../ui/BaseColorPicker.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { textColor: 'modelValue' }

const template = `
	<div style="${CENTERED}">
		<BaseColorPicker v-bind="args" v-model="textColor" trigger-variant="icon" has-indicator>
			<template #trigger>
				<BaseIcon name="color-picker" :size-scale="80" />
			</template>
		</BaseColorPicker>
	</div>
`

export const IconTrigger: StoryObj<typeof meta> = {
	args: { modelValue: '#be123c' },
	parameters: {
		docs: {
			description: {
				story: [
					'`triggerVariant="icon"` — плоская кнопка-иконка 28 px для тулбаров: иконка в слоте `trigger`, фона и рамки нет,',
					'`hasIndicator` рисует под иконкой полоску текущего цвета. Так выглядят кнопки цвета в BaseEditor —',
					'своего CSS поверх `.base-color-picker__swatch` не нужно.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseColorPicker', 'BaseIcon'], models }),
		},
	},
	render: args => ({
		components: { BaseColorPicker, BaseIcon },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Выбранный цвет #be123c' })
		await expect(button.style.backgroundColor).toBe('')
		await expect(button).toHaveClass('base-color-picker__swatch--icon', 'base-color-picker__swatch--indicated')
	},
}
