import { expect } from 'storybook/test'
import type meta from '../../BaseRadio.stories'
import { DELIVERY_OPTIONS } from '../../shared'
import BaseRadio from '../../../ui/BaseRadio.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const DELIVERY_DETAILS: Record<string, string> = {
	courier: 'Завтра с 10:00 до 22:00 · 290 ₽',
	pickup: 'Пункт выдачи на Тверской, 12 · бесплатно',
	post: '5–7 дней · 190 ₽',
}

const details = DELIVERY_DETAILS

const models = { picked: 'modelValue' }

const template = `
	<BaseRadio v-bind="args" v-model="picked">
		<template #option="{ option }">
			<span style="display: flex; flex-direction: column;">
				<span>{{ option.label }}</span>
				<span style="color: var(--rise-text-muted); font-weight: var(--rise-font-weight-normal);">{{ details[option.value] }}</span>
			</span>
		</template>
	</BaseRadio>
`

export const OptionSlot: StoryObj<typeof meta> = {
	args: { isVertical: true, name: 'delivery-details' },
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `option({ option, isChecked })` заменяет подпись опции — например, добавляет срок и цену.',
					'Круг, выбор кликом по подписи и стрелки работают как обычно.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseRadio'], script: `const details = ${literal(details)}`, models }),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseRadio },
		setup: useStorySetup(args, { models, data: { details } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getAllByRole('radio')).toHaveLength(DELIVERY_OPTIONS.length)
		await userEvent.click(canvas.getByText('Пункт выдачи на Тверской, 12 · бесплатно'))
		await expect(canvas.getByRole('radio', { name: /Самовывоз/ })).toBeChecked()
	},
}
