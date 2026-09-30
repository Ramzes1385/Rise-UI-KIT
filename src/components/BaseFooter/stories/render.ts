import BaseFooter from '../ui/BaseFooter.vue'
import { BaseLink } from '@components/BaseLink'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFooter v-bind="args">
		<template #start>© 2026 Rise Studio</template>
		<nav aria-label="Документы" style="display: flex; gap: 16px">
			<BaseLink href="#terms">Условия</BaseLink>
			<BaseLink href="#privacy">Конфиденциальность</BaseLink>
			<BaseLink href="#help">Помощь</BaseLink>
		</nav>
		<template #end>Сделано в Волгограде</template>
	</BaseFooter>
`

export const source = storySource({ template, imports: ['BaseFooter', 'BaseLink'] })

export const render = (args => ({
	components: { BaseFooter, BaseLink },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseFooter>['render']
