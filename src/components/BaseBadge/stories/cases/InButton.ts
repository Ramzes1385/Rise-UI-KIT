import { expect } from 'storybook/test'
import type meta from '../BaseBadge.stories'
import BaseBadge from '../../ui/BaseBadge.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const InButton: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Счётчик в кнопке: бейдж в слоте `right` у `BaseButton`. Число входит в доступное имя кнопки.' },
			source: {
				code: [
					'<BaseButton variant="outline">',
					'  Входящие',
					'  <template #right><BaseBadge variant="soft" label="12" /></template>',
					'</BaseButton>',
				].join('\n'),
			},
		},
	},
	args: { variant: 'soft' },
	render: args => ({
		components: { BaseBadge, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'label', 'onClick']) }),
		template: `
			<BaseButton variant="outline">
				Входящие
				<template #right><BaseBadge v-bind="props" label="12" /></template>
			</BaseButton>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button')).toHaveAccessibleName(/^Входящие\s*12$/)
	},
}
