import { expect } from 'storybook/test'
import type meta from '../../BaseFormWizard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource } from '@/stories/helpers'
import { FORM_WIZARD_VARIANTS } from '../../../types/BaseFormWizard.types'
import { DEMO_STEPS, type WizardCaseOptions, wizardRender, wizardSource } from '../../shared'

const template = `
	<div class="story-stack">
		<div v-for="variant in FORM_WIZARD_VARIANTS" :key="variant">
			<span class="story-label">{{ variant }}</span>
			<BaseFormWizard v-bind="args" :variant="variant" :steps="steps">
				<template #default="{ step }">
					<p>Здесь поля шага «{{ step.title }}»</p>
				</template>
			</BaseFormWizard>
		</div>
	</div>
`

const options: WizardCaseOptions = {
	template,
	script: `const steps = ${literal(DEMO_STEPS)}`,
	data: { FORM_WIZARD_VARIANTS, steps: DEMO_STEPS },
	imports: ['FORM_WIZARD_VARIANTS'],
}
const source = storySource(wizardSource(options))

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isLinear'] },
		docs: {
			description: {
				story: 'Все варианты оформления: `default` — без рамки, `outline` — рамка вокруг мастера, `soft` — мягкий фон. Размер из Controls применяется ко всем.',
			},
			source: source,
		},
	},
	render: wizardRender(options),
	play: async ({ canvasElement }) => {
		const roots = [...canvasElement.querySelectorAll('.base-form-wizard')]
		await expect(roots).toHaveLength(FORM_WIZARD_VARIANTS.length)
		await expect(roots[1]).toHaveClass('base-form-wizard--outline')
		await expect(roots[2]).toHaveClass('base-form-wizard--soft')
	},
}
