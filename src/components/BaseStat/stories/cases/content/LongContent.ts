import { expect } from 'storybook/test'
import type meta from '../../BaseStat.stories'
import BaseStat from '../../../ui/BaseStat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="max-width: 200px">
		<BaseStat v-bind="args">
			<template #icon><span aria-hidden="true">₽</span></template>
		</BaseStat>
	</div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Узкая карточка: длинная подпись переносится и не заходит под значок, длинное число переносится по цифрам.',
			},
			source: storySource({ template, imports: ['BaseStat'] }),
		},
	},
	args: {
		label: 'Выручка интернет-магазина с учётом возвратов и скидок',
		value: 1_234_567_890.12,
		valueFormat: { style: 'currency', currency: 'RUB' },
		changeLabel: 'к тому же периоду прошлого года',
	},
	render: args => ({
		components: { BaseStat },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const stat = canvasElement.querySelector('.base-stat') as HTMLElement
		await expect(stat.scrollWidth).toBeLessThanOrEqual(stat.clientWidth + 1)
		await expect(stat).toHaveClass('base-stat--with-icon')
	},
}
