import { LETTERS, BOX, PANES } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import BaseSplitter from '../ui/BaseSplitter.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const letters = LETTERS

const box = BOX

const models = { sizes: 'modelValue' }

const template = `
	<div :style="box"><BaseSplitter v-bind="args" v-model="sizes">${PANES}</BaseSplitter></div>
`

export const source = storySource({
	template,
	imports: ['BaseSplitter'],
	models,
	script: [`const letters = ${literal(letters)}`, `const box = ${literal(box)}`].join('\n'),
})

export const render = (args => ({
	components: { BaseSplitter },
	setup: useStorySetup(args, { models, data: { letters, box }, slots: ['default'] }),
	template,
})) satisfies Meta<typeof BaseSplitter>['render']
