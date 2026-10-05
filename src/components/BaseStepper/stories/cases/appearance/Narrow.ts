import { SLOT_KEYS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseStepper from '../../../ui/BaseStepper.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { step: 'modelValue' }

const template = `
	<div class="story-narrow">
		<BaseStepper v-bind="args" v-model="step" />
	</div>
`

const STEP_MIN_WIDTH = 112

function isInside(inner: DOMRect, outer: DOMRect): boolean {
	return inner.left >= outer.left - 1 && inner.right <= outer.right + 1
}

export const Narrow: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Узкая ширина: шаг не сжимается уже 112px (`--stepper-step-min-width`), лишние шаги уходят в прокрутку ленты, а',
					'текущий шаг прокручивается в видимую часть. При `clickable: none` в ленте нет кнопок, поэтому прокручиваемая лента',
					'сама получает фокус с клавиатуры.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseStepper'], models, omit: SLOT_KEYS }),
		},
	},
	args: { modelValue: 4, clickable: 'none' },
	render: args => ({
		components: { BaseStepper },
		setup: useStorySetup(args, { models, slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvasElement, userEvent }) => {
		const list = canvasElement.querySelector('.base-stepper__items') as HTMLElement
		const steps = [...list.querySelectorAll<HTMLElement>('.base-stepper__step')]
		await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
		for (const step of steps) {
			await expect(step.getBoundingClientRect().width).toBeGreaterThanOrEqual(STEP_MIN_WIDTH - 0.5)
			for (const text of step.querySelectorAll<HTMLElement>('.base-stepper__label, .base-stepper__description')) {
				await expect(isInside(text.getBoundingClientRect(), step.getBoundingClientRect())).toBe(true)
			}
		}
		await waitFor(() => expect(isInside(steps.at(-1)!.getBoundingClientRect(), list.getBoundingClientRect())).toBe(true))

		await expect(list.scrollLeft).toBeGreaterThan(0)
		await userEvent.tab()
		await expect(list).toHaveFocus()
	},
}
