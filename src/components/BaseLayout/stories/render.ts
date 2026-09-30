import { SECTIONS } from './shared'
import BaseLayout from '../ui/BaseLayout.vue'
import { BaseLink } from '@components/BaseLink'
import type { Meta } from '@storybook/vue3-vite'
import { BaseFooter } from '@components/BaseFooter'
import { BaseHeader } from '@components/BaseHeader'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const orders = Array.from({ length: 12 }, (_, index) => `Заказ № ${1040 + index} — ${index % 3 === 0 ? 'ждёт оплаты' : 'собран'}`)

const template = `
	<BaseLayout v-bind="args">
		<template #header>
			<BaseHeader title="Rise CRM" href="#home">
				<template #end><BaseLink href="#profile">Анна Смирнова</BaseLink></template>
				<template #menu="{ close }">
					<nav aria-label="Разделы (меню)" class="story-stack">
						<BaseLink v-for="section in sections" :key="section" :href="'#' + section" @click="close">{{ section }}</BaseLink>
					</nav>
				</template>
			</BaseHeader>
		</template>
		<template #sidebar>
			<nav aria-label="Разделы" class="story-stack" style="width: 200px; padding: 16px; box-sizing: border-box">
				<BaseLink v-for="section in sections" :key="section" :href="'#' + section">{{ section }}</BaseLink>
			</nav>
		</template>
		<div style="padding: 24px">
			<h1 style="margin-top: 0">Заказы</h1>
			<p v-for="order in orders" :key="order">{{ order }}</p>
		</div>
		<template #footer>
			<BaseFooter><template #start>© 2026 Rise Studio</template></BaseFooter>
		</template>
	</BaseLayout>
`

export const source = storySource({
	template,
	imports: ['BaseLayout', 'BaseHeader', 'BaseFooter', 'BaseLink'],
	script: [`const sections = ${literal(SECTIONS)}`, `const orders = ${literal(orders)}`].join('\n'),
})

export const render = (args => ({
	components: { BaseLayout, BaseHeader, BaseFooter, BaseLink },
	setup: useStorySetup(args, { data: { sections: SECTIONS, orders } }),
	template,
})) satisfies Meta<typeof BaseLayout>['render']
