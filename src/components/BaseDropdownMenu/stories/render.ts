import { BaseIcon } from '@components/BaseIcon'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseDropdownMenu from '../ui/BaseDropdownMenu.vue'

export const render = (args => ({
	components: { BaseDropdownMenu, BaseButton, BaseIcon },
	setup: () => ({ props: useArgsWithoutSlots(args, []) }),
	template: `
			<BaseDropdownMenu v-bind="props">
				<BaseButton variant="outline">
					Действия
					<template #right><BaseIcon name="chevron-down" :size-scale="80" /></template>
				</BaseButton>
			</BaseDropdownMenu>
		`,
})) satisfies Meta<typeof BaseDropdownMenu>['render']
