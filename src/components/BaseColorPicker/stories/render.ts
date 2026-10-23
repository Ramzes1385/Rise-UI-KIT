import { CENTERED } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import BaseColorPicker from '../ui/BaseColorPicker.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const models = { color: 'modelValue' }

const centered = CENTERED

const template = `
	<div :style="centered"><BaseColorPicker v-bind="args" v-model="color" /></div>
`

export const source = storySource({ template, imports: ['BaseColorPicker'], models, script: `const centered = ${literal(centered)}` })

export const render = (args => ({
	components: { BaseColorPicker },
	setup: useStorySetup(args, { models, data: { centered }, slots: [] }),
	template,
})) satisfies Meta<typeof BaseColorPicker>['render']
