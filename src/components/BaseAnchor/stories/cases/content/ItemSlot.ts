import { items } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseAnchor.stories'
import BaseAnchor from '../../../ui/BaseAnchor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseAnchor v-bind="args" :items="items" style="width: 220px">
		<template #item="{ item, isActive }">{{ item.label }}{{ isActive ? ' — вы здесь' : '' }}</template>
	</BaseAnchor>
`

export const ItemSlot: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Слот `item` — своё содержимое ссылки: получает пункт (`id`, `label`, `level`) и `isActive`.' },
			source: storySource({ template, imports: ['BaseAnchor'], script: `const items = ${literal(items)}` }),
		},
	},
	render: args => ({
		components: { BaseAnchor },
		setup: useStorySetup(args, { data: { items } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Обзор — вы здесь' })).toHaveAttribute('aria-current', 'location')
	},
}
