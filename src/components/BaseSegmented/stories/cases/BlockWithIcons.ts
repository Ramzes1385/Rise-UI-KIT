import { expect } from 'storybook/test'
import type meta from '../BaseSegmented.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSegmented from '../../ui/BaseSegmented.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'
import type { SegmentedOption } from '../../types/BaseSegmented.types'

const VIEWS: SegmentedOption[] = [
	{ value: 'list', label: 'Список', icon: 'list-bullet' },
	{ value: 'cards', label: 'Карточки', icon: 'image' },
	{ value: 'calendar', label: 'Календарь', icon: 'calendar' },
]

export const BlockWithIcons: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Во всю ширину с иконками: сегменты делят ширину поровну.' } } },
	args: { options: VIEWS, modelValue: 'cards', isBlock: true, label: 'Вид' },
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseSegmented },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: '<div style="max-width: 420px;"><BaseSegmented v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvasElement }) => {
		const segments = canvasElement.querySelectorAll<HTMLElement>('.base-segmented__segment')
		await expect(Math.abs(segments[0].offsetWidth - segments[2].offsetWidth)).toBeLessThanOrEqual(1)
	},
}
