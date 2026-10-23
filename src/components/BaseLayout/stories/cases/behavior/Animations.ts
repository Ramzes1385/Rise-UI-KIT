import { SECTIONS } from '../../shared'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseLayout.stories'
import { expect, waitFor } from 'storybook/test'
import BaseLayout from '../../../ui/BaseLayout.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const state = { isSidebarShown: true }

const template = `
	<BaseLayout v-bind="args" :is-sidebar-visible-on-mobile="isSidebarShown">
		<template #sidebar>
			<nav aria-label="Разделы" class="story-stack" style="padding: 16px">
				<BaseLink v-for="section in sections" :key="section" :href="'#' + section">{{ section }}</BaseLink>
			</nav>
		</template>
		<div style="padding: 24px">
			<h1 style="margin-top: 0">Заказы</h1>
			<BaseButton variant="outline" @click="isSidebarShown = !isSidebarShown">Показать или скрыть меню</BaseButton>
		</div>
	</BaseLayout>
`

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Боковое меню на экране уже 768px (`isSidebarVisibleOnMobile`): появляется выездом слева с проявлением',
					'(`--rise-duration`, `--rise-ease-out`), уходит быстрее (`--rise-duration-fast`, `--rise-ease-in`). Скрытое меню —',
					'`display: none`: его ссылки не получают фокус и не видны скринридеру. Движение видно на узком экране — включите его',
					'в панели вьюпорта Storybook; на широком меню видно всегда. Пресет — атрибут `data-rise-motion` области или',
					'`createUiKitPlugin({ motion })`; в `none` и при «уменьшить движение» меню появляется сразу. Каркас на странице один',
					'(один `<main>`), поэтому колонок пресетов здесь нет. Браузеры без `@starting-style` показывают меню сразу.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseLayout', 'BaseLink', 'BaseButton'],
				state,
				script: `const sections = ${literal(SECTIONS)}`,
				omit: ['isSidebarVisibleOnMobile'],
			}),
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseLayout, BaseLink, BaseButton },
		setup: useStorySetup(args, { state, data: { sections: SECTIONS } }),
		template,
	}),
	play: async ({ canvasElement, canvas, userEvent }) => {
		const root = canvasElement.querySelector('.base-layout')!
		const toggle = canvas.getByRole('button', { name: 'Показать или скрыть меню' })

		await expect(root).toHaveClass('base-layout--mobile-sidebar')
		await userEvent.click(toggle)
		await waitFor(() => expect(root).not.toHaveClass('base-layout--mobile-sidebar'))
		await userEvent.click(toggle)
		await waitFor(() => expect(root).toHaveClass('base-layout--mobile-sidebar'))
	},
}
