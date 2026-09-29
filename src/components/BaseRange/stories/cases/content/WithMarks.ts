import { expect } from 'storybook/test'
import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { RangeMark } from '../../../types/BaseRange.types'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

const VOLUME_MARKS: RangeMark[] = [
	{ value: 0, label: '0' },
	{ value: 25, tickSize: 'minor' },
	{ value: 50, label: '50' },
	{ value: 75, tickSize: 'minor' },
	{ value: 100, label: '100' },
	...[5, 10, 15, 20, 30, 35, 40, 45, 55, 60, 65, 70, 80, 85, 90, 95].map(value => ({ value, tickSize: 'sub' as const })),
]

export const WithMarks: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Деления (`marks`): `tickSize` — длина линии (`major`, `minor`, `sub`), `label` — подпись под ней.',
					'Деления только размечают шкалу: значение по-прежнему меняется с шагом `step`.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: 60, marks: VOLUME_MARKS, step: 5 },
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseRange },
			setup: () => ({ props: useArgsWithoutSlots(args, ['thumb']), onUpdate }),
			template:
				'<div class="story-narrow" style="padding: 0 12px;"><BaseRange v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText('50')).toBeVisible()
		await expect(canvas.getByRole('slider', { name: 'Громкость' })).toHaveAttribute('aria-valuenow', '60')
	},
}
