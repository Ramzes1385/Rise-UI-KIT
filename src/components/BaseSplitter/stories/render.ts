import { LETTERS } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import BaseSplitter from '../ui/BaseSplitter.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const letters = LETTERS

const models = { sizes: 'modelValue' }

const template = `
	<div style="height: 240px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
		<BaseSplitter v-bind="args" v-model="sizes">
			<template #start>
				<ul aria-label="Письма" style="margin: 0; padding: 12px 16px; list-style: none; display: grid; gap: 8px">
					<li v-for="letter in letters" :key="letter">{{ letter }}</li>
				</ul>
			</template>
			<template #end>
				<article style="padding: 12px 16px">
					<h3 style="margin-top: 0">Счёт за сентябрь</h3>
					<p style="margin: 0">Добрый день! Во вложении счёт за сентябрь, оплата до 10 октября.</p>
				</article>
			</template>
		</BaseSplitter>
	</div>
`

export const source = storySource({ template, imports: ['BaseSplitter'], models, script: `const letters = ${literal(letters)}` })

export const render = (args => ({
	components: { BaseSplitter },
	setup: useStorySetup(args, { models, data: { letters }, slots: ['default'] }),
	template,
})) satisfies Meta<typeof BaseSplitter>['render']
