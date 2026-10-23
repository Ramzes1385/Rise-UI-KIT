import { expect } from 'storybook/test'
import type meta from '../../BaseFormWizard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource } from '@/stories/helpers'
import { DEMO_STEPS, type WizardCaseOptions, wizardRender, wizardSource } from '../../shared'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name">
			<span class="story-label">{{ preset.label }}</span>
			<BaseFormWizard v-bind="args" :size-scale="preset.sizeScale" :steps="steps">
				<template #default="{ step }">
					<p>Здесь поля шага «{{ step.title }}»</p>
				</template>
			</BaseFormWizard>
		</div>
	</div>
`

const options: WizardCaseOptions = {
	template,
	script: `const steps = ${literal(DEMO_STEPS)}\nconst presets = ${literal(presets)}`,
	data: { steps: DEMO_STEPS, presets },
}
const source = storySource(wizardSource(options))

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'isLinear'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125. Масштабируются степпер, тексты, поля и кнопки.',
			},
			source: source,
		},
	},
	render: wizardRender(options),
	play: async ({ canvasElement }) => {
		const heights = [...canvasElement.querySelectorAll('.base-form-wizard')].map(root => root.getBoundingClientRect().height)
		await expect(heights).toHaveLength(presets.length)
		await expect(heights[0]).toBeLessThan(heights[heights.length - 1])
	},
}
