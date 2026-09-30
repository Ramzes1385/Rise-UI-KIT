import { BaseIcon } from '@components/BaseIcon'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import BaseDropdownMenu from '../ui/BaseDropdownMenu.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseDropdownMenu v-bind="args">
		<BaseButton variant="outline">
			Действия
			<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
		</BaseButton>
	</BaseDropdownMenu>
`

export const source = storySource({ template, imports: ['BaseDropdownMenu', 'BaseButton', 'BaseIcon'] })

export const render = (args => ({
	components: { BaseDropdownMenu, BaseButton, BaseIcon },
	setup: useStorySetup(args, { slots: [] }),
	template,
})) satisfies Meta<typeof BaseDropdownMenu>['render']
