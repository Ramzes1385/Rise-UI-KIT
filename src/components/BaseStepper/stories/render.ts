import { SLOT_KEYS } from './shared'
import BaseStepper from '../ui/BaseStepper.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { step: 'modelValue' }

const template = `
	<BaseStepper v-bind="args" v-model="step" />
`

export const source = storySource({ template, imports: ['BaseStepper'], models, omit: SLOT_KEYS })

export const render = (args => ({
	components: { BaseStepper },
	setup: useStorySetup(args, { models, slots: SLOT_KEYS }),
	template,
})) satisfies Meta<typeof BaseStepper>['render']
