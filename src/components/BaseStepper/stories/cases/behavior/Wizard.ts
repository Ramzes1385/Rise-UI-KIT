import { SLOT_KEYS, STEPS } from '../../shared'
import { waitFor, expect } from 'storybook/test'
import type meta from '../../BaseStepper.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseStepper from '../../../ui/BaseStepper.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const models = { step: 'modelValue' }

const HIDDEN = [...SLOT_KEYS, 'items']

const template = `
	<BaseStepper v-bind="args" v-model="step" :items="steps">
		<template #header><strong>Оформление заказа</strong></template>
		<template #footer>
			<div class="story-row">
				<BaseButton variant="outline" :is-disabled="step <= 1" @click="step = step - 1">Назад</BaseButton>
				<BaseButton :is-disabled="step >= steps.length" @click="step = step + 1">Далее</BaseButton>
			</div>
		</template>
	</BaseStepper>
`

export const Wizard: StoryObj<typeof meta> = {
	args: { variant: 'animated', modelValue: 1 },
	parameters: {
		docs: {
			description: {
				story: [
					'Пошаговая форма: слоты `header` и `footer`, кнопки «Назад» и «Далее» меняют `v-model`, вариант `animated`',
					'заполняет линию медленнее.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseStepper', 'BaseButton'],
				models,
				script: `const steps = ${literal(STEPS)}`,
				omit: HIDDEN,
			}),
		},
	},
	render: args => ({
		components: { BaseStepper, BaseButton },
		setup: useStorySetup(args, { models, data: { steps: STEPS }, slots: HIDDEN }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Далее' }))
		await waitFor(() => expect(canvas.getByRole('button', { name: /Доставка/ })).toHaveAttribute('aria-current', 'step'))
		await expect(canvas.getByRole('button', { name: 'Назад' })).toBeEnabled()
	},
}
