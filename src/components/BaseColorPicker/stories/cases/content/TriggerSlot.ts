import { CENTERED } from '../../shared'
import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorPicker.stories'
import BaseColorPicker from '../../../ui/BaseColorPicker.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

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
			source: {
				code: [
					'<BaseColorPicker v-model="textColor" has-transparent-swatch>',
					'  <template #trigger><BaseIcon name="color-picker" :color="textColor" /></template>',
					'</BaseColorPicker>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseColorPicker, BaseIcon },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate, centered: CENTERED }),
			template: `
				<div :style="centered">
					<BaseColorPicker v-bind="props" @update:model-value="onUpdate">
						<template #trigger>
							<BaseIcon name="color-picker" :color="props.modelValue" :size-scale="80" />
						</template>
					</BaseColorPicker>
				</div>
			`,
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Выбранный цвет #be123c' }).style.backgroundColor).toBe('')
	},
}
