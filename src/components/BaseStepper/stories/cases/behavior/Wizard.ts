import { SLOT_KEYS } from '../../shared'
import { waitFor, expect } from 'storybook/test'
import type meta from '../../BaseStepper.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseStepper from '../../../ui/BaseStepper.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const Wizard: StoryObj<typeof meta> = {
	args: { variant: 'animated', modelValue: 1 },
	parameters: {
		docs: {
			description: {
				story: [
					'Пошаговая форма: слоты `header` и `footer`, кнопки «Назад» и «Далее» меняют `v-model`, вариант `animated`',
					'плавно заполняет линию.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseStepper v-model="step" :items="items" variant="animated">',
					'  <template #header>Оформление заказа</template>',
					'  <template #footer>',
					'    <BaseButton variant="outline" :is-disabled="step === 1" @click="step--">Назад</BaseButton>',
					'    <BaseButton :is-disabled="step === items.length" @click="step++">Далее</BaseButton>',
					'  </template>',
					'</BaseStepper>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseStepper, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate }),
			template: `
				<BaseStepper v-bind="props" @update:model-value="onUpdate">
					<template #header><strong>Оформление заказа</strong></template>
					<template #footer>
						<div class="story-row">
							<BaseButton variant="outline" :is-disabled="props.modelValue <= 1" @click="onUpdate(props.modelValue - 1)">Назад</BaseButton>
							<BaseButton :is-disabled="props.modelValue >= props.items.length" @click="onUpdate(props.modelValue + 1)">Далее</BaseButton>
						</div>
					</template>
				</BaseStepper>
			`,
		}
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Далее' }))
		await waitFor(() => expect(canvas.getByRole('button', { name: /Доставка/ })).toHaveAttribute('aria-current', 'step'))
		await expect(canvas.getByRole('button', { name: 'Назад' })).toBeEnabled()
	},
}
