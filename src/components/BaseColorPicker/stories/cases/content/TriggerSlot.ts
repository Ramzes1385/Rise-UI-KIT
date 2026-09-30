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
		<BaseColorPicker v-bind="args" v-model="textColor">
			<template #trigger>
				<BaseIcon name="color-picker" :color="textColor" :size-scale="80" />
			</template>
		</BaseColorPicker>
	</div>
`

export const TriggerSlot: StoryObj<typeof meta> = {
	args: { hasTransparentSwatch: true, modelValue: '#be123c' },
	parameters: {
		docs: {
			description: {
				story: [
					'Свой триггер: `hasTransparentSwatch` не заливает образец цветом, а слот `trigger` показывает иконку —',
					'так выглядит кнопка цвета текста в тулбаре редактора.',
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
		await expect(canvas.getByRole('button', { name: 'Выбранный цвет #be123c' }).style.backgroundColor).toBe('')
	},
}
