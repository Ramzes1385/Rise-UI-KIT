import BaseFooter from '../ui/BaseFooter.vue'
import { BaseLink } from '@components/BaseLink'
import type { Meta } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

const TEMPLATE = `
	<BaseFooter v-bind="props">
		<template #start>© 2026 Rise Studio</template>
		<nav aria-label="Документы" style="display: flex; gap: 16px">
			<BaseLink href="#terms">Условия</BaseLink>
			<BaseLink href="#privacy">Конфиденциальность</BaseLink>
			<BaseLink href="#help">Помощь</BaseLink>
		</nav>
		<template #end>Сделано в Волгограде</template>
	</BaseFooter>
`

export const render = (args => ({
	components: { BaseFooter, BaseLink },
	setup: () => ({ props: useArgsWithoutSlots(args) }),
	template: TEMPLATE,
})) satisfies Meta<typeof BaseFooter>['render']
