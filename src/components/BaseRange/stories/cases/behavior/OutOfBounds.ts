import { expect } from 'storybook/test'
import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow"><BaseRange v-bind="args" /></div>
`

export const OutOfBounds: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['modelValue', 'min', 'max', 'step'] },
		docs: {
			description: {
				story: [
					'Значение вне `min`…`max` показывается на ближайшей границе: ползунок, заливка, подпись и `aria-valuenow`',
					'не выходят за шкалу. v-model не переписывается — новое значение придёт после действия пользователя.',
					'Недопустимые пропсы заменяются с предупреждением в консоли: `step` ≤ 0 — шаг 1, `max` меньше `min` — диапазон сводится к `min`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseRange'], omit: ['thumb'] }),
		},
	},
	args: { modelValue: 140, min: 0, max: 100, hasLabel: true, ariaLabel: 'Громкость' },
	render: args => ({
		components: { BaseRange },
		setup: useStorySetup(args, { slots: ['thumb'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const thumb = canvas.getByRole('slider', { name: 'Громкость' })
		await expect(thumb).toHaveAttribute('aria-valuenow', '100')
		await expect(thumb).toHaveAttribute('aria-valuemax', '100')
		await expect(canvas.getAllByText('100')).toHaveLength(2)
	},
}
