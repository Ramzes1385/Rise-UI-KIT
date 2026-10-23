import { SECTIONS } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseLayout.stories'
import { BaseLink } from '@components/BaseLink'
import BaseLayout from '../../ui/BaseLayout.vue'
import { BaseFooter } from '@components/BaseFooter'
import { BaseHeader } from '@components/BaseHeader'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

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
			<h1 style="margin-top: 0">Отчёты</h1>
			<p>Отчётов за сентябрь пока нет.</p>
		</div>
		<template #footer>
			<BaseFooter><template #start>© 2026 Rise Studio</template></BaseFooter>
		</template>
	</BaseLayout>
`

export const ShortPage: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Короткая страница: подвал всё равно внизу окна.' },
			source: storySource({
				template,
				imports: ['BaseLayout', 'BaseHeader', 'BaseFooter', 'BaseLink'],
				script: `const sections = ${literal(SECTIONS)}`,
			}),
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseLayout, BaseHeader, BaseFooter, BaseLink },
		setup: useStorySetup(args, { data: { sections: SECTIONS } }),
		template,
	}),
	play: async ({ canvas }) => {
		const footer = canvas.getByRole('contentinfo')
		await expect(Math.round(footer.getBoundingClientRect().bottom)).toBe(window.innerHeight)
	},
}
