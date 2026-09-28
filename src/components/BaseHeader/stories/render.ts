import { NAV } from './shared'
import BaseHeader from '../ui/BaseHeader.vue'
import { BaseLink } from '@components/BaseLink'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseHeader, BaseLink, BaseButton },
	setup: () => ({ props: useArgsWithoutSlots(args) }),
	template: `
			<BaseHeader v-bind="props">
				${NAV}
				<template #end><BaseButton variant="outline">Войти</BaseButton></template>
			</BaseHeader>
		`,
})) satisfies Meta<typeof BaseHeader>['render']
