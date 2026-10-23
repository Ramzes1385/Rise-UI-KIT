import { expect } from 'storybook/test'
import { SLOT_KEYS } from '../../shared'
import { BaseIcon } from '@components/BaseIcon'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'
import BaseBreadcrumbs from '../../../ui/BaseBreadcrumbs.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseBreadcrumbs v-bind="args">
		<template #home><BaseIcon name="star" :size-scale="80" /></template>
		<template #separator>—</template>
		<template #item="{ item, index }">{{ index + 1 }}. {{ item.label }}</template>
	</BaseBreadcrumbs>
`

export const CustomSlots: StoryObj<typeof meta> = {
	args: { showHome: true },
	parameters: {
		docs: {
			description: { story: 'Слоты `item`, `separator` и `home` заменяют разметку крошки, разделителя и кнопки «домой».' },
			source: storySource({ template, imports: ['BaseBreadcrumbs', 'BaseIcon'], omit: ['linkComponent'] }),
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs, BaseIcon },
		setup: useStorySetup(args, { slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('5. Ультрабук 13"')).toBeVisible()
	},
}
