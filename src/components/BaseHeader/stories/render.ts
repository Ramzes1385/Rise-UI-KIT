import BaseHeader from '../ui/BaseHeader.vue'
import { BaseLink } from '@components/BaseLink'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseHeader v-bind="args">
		<nav aria-label="Основное" class="story-row" style="gap: 20px">
			<BaseLink href="#orders">Заказы</BaseLink>
			<BaseLink href="#clients">Клиенты</BaseLink>
			<BaseLink href="#reports">Отчёты</BaseLink>
		</nav>
		<template #end><BaseButton variant="outline">Войти</BaseButton></template>
	</BaseHeader>
`

export const source = storySource({ template, imports: ['BaseHeader', 'BaseLink', 'BaseButton'] })

export const render = (args => ({
	components: { BaseHeader, BaseLink, BaseButton },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseHeader>['render']
