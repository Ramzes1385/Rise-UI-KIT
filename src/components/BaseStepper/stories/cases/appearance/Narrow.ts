import { SLOT_KEYS, STEPS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseStepper from '../../../ui/BaseStepper.vue'
import type { BaseStepperStep } from '../../../types/BaseStepper.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const models = { step: 'modelValue' }

const HIDDEN = [...SLOT_KEYS, 'items']

const MANY_STEPS: BaseStepperStep[] = Array.from({ length: 8 }, (_, index) => ({
	label: `Этап ${index + 1}`,
	description: 'Описание этапа',
}))

const template = `
	<div class="story-stack">
		<div class="story-narrow">
			<BaseStepper v-bind="args" v-model="step" :items="steps" />
		</div>
		<div class="story-medium">
			<BaseStepper v-bind="args" :model-value="manySteps.length" :items="manySteps" />
		</div>
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
					'Узкая ширина (по ширине самого степпера, не окна): до 480px лента сжимается в «кружки с линиями», подписи шагов',
					'остаются для скринридера, а под лентой выводится «Шаг N из M: подпись» текущего шага — лента помещается и в колонку 280px.',
					'Шире 480px подписи видны, шаг не уже 112px, а лишние шаги уходят в прокрутку ленты (вторая лента — 8 шагов в 560px):',
					'текущий шаг прокручивается в видимую часть, при `clickable: none` в ленте нет кнопок, поэтому прокручиваемая лента сама',
					'получает фокус с клавиатуры.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseStepper'],
				models,
				script: `const steps = ${literal(STEPS)}\nconst manySteps = ${literal(MANY_STEPS)}`,
				omit: HIDDEN,
			}),
		},
	},
	args: { modelValue: 4, clickable: 'none' },
	render: args => ({
		components: { BaseStepper },
		setup: useStorySetup(args, { models, data: { steps: STEPS, manySteps: MANY_STEPS }, slots: HIDDEN }),
		template,
	}),
	play: async ({ canvasElement, userEvent }) => {
		const [compact, wide] = [...canvasElement.querySelectorAll<HTMLElement>('.base-stepper')]
		const compactList = compact.querySelector('.base-stepper__items') as HTMLElement
		await waitFor(() => expect(getComputedStyle(compact, '::after').content).toContain('Шаг 4 из 4: Подтверждение'))
		await expect(compactList.scrollWidth).toBeLessThanOrEqual(compactList.clientWidth)
		for (const step of compact.querySelectorAll<HTMLElement>('.base-stepper__step')) {
			await expect(step.getBoundingClientRect().width).toBeLessThan(STEP_MIN_WIDTH)
		}

		const list = wide.querySelector('.base-stepper__items') as HTMLElement
		const steps = [...list.querySelectorAll<HTMLElement>('.base-stepper__step')]
		await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
		await expect(getComputedStyle(wide, '::after').content).toBe('none')
		for (const step of steps) {
			await expect(step.getBoundingClientRect().width).toBeGreaterThanOrEqual(STEP_MIN_WIDTH - 0.5)
			for (const text of step.querySelectorAll<HTMLElement>('.base-stepper__label, .base-stepper__description')) {
				await expect(isInside(text.getBoundingClientRect(), step.getBoundingClientRect())).toBe(true)
			}
		}
		await waitFor(() => expect(isInside(steps.at(-1)!.getBoundingClientRect(), list.getBoundingClientRect())).toBe(true))

		await expect(Math.abs(list.scrollLeft)).toBeGreaterThan(0)
		await userEvent.tab()
		await expect(list).toHaveFocus()
	},
}
