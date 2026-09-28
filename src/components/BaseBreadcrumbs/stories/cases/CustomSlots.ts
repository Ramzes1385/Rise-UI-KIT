import { SLOT_KEYS } from '../shared'
import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../BaseBreadcrumbs.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseBreadcrumbs from '../../ui/BaseBreadcrumbs.vue'

export const CustomSlots: StoryObj<typeof meta> = {
	args: { showHome: true },
	parameters: {
		docs: {
			description: { story: 'Слоты `item`, `separator` и `home` заменяют разметку крошки, разделителя и кнопки «домой».' },
			source: {
				code: [
					'<BaseBreadcrumbs :items="items" show-home>',
					'  <template #home><BaseIcon name="star" /></template>',
					'  <template #separator>—</template>',
					'  <template #item="{ item, index }">{{ index + 1 }}. {{ item.label }}</template>',
					'</BaseBreadcrumbs>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS) }),
		template: `
			<BaseBreadcrumbs v-bind="props">
				<template #home><BaseIcon name="star" :size-scale="80" /></template>
				<template #separator>—</template>
				<template #item="{ item, index }">{{ index + 1 }}. {{ item.label }}</template>
			</BaseBreadcrumbs>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('5. Ультрабук 13"')).toBeVisible()
	},
}
