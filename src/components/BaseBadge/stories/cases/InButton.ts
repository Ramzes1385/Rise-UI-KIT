import { expect } from 'storybook/test'
import type meta from '../BaseBadge.stories'
import BaseBadge from '../../ui/BaseBadge.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseButton variant="outline">
		Входящие
		<template #right><BaseBadge v-bind="args" label="12" /></template>
	</BaseButton>
`

export const InButton: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Счётчик в кнопке: бейдж в слоте `right` у `BaseButton`. Число входит в доступное имя кнопки.' },
			source: storySource({ template, imports: ['BaseBadge', 'BaseButton'], omit: ['default', 'label', 'onClick'] }),
		},
	},
	args: { variant: 'soft' },
	render: args => ({
		components: { BaseBadge, BaseButton },
		setup: useStorySetup(args, { slots: ['default', 'label', 'onClick'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button')).toHaveAccessibleName(/^Входящие\s*12$/)
	},
}
