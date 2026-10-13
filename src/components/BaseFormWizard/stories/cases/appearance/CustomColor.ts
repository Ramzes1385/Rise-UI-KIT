import { expect } from 'storybook/test'
import type meta from '../../BaseFormWizard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource } from '@/stories/helpers'
import { DEMO_STEPS, type WizardCaseOptions, wizardRender, wizardSource } from '../../shared'

const template = `
	<div class="story-medium">
		<BaseFormWizard v-bind="args" :steps="steps">
			<template #default="{ step }">
				<p>Здесь поля шага «{{ step.title }}»</p>
			</template>
		</BaseFormWizard>
	</div>
`

const options: WizardCaseOptions = { template, script: `const steps = ${literal(DEMO_STEPS)}`, data: { steps: DEMO_STEPS } }
const source = storySource(wizardSource(options))

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет через `color`: фон и текст мастера, заголовок шага наследует цвет текста. Для обычных мастеров хватает токенов `--rise-form-wizard-*`.',
			},
			source: source,
		},
	},
	args: { color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },
	render: wizardRender(options),
	play: async ({ canvasElement, canvas }) => {
		const root = canvasElement.querySelector('.base-form-wizard') as HTMLElement
		await expect(getComputedStyle(root).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(canvas.getByRole('heading', { name: 'Аккаунт' })).color).toBe('rgb(255, 255, 255)')
	},
}
