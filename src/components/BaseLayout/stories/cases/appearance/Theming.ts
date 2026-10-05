import { SECTIONS } from '../../shared'
import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseLayout.stories'
import BaseLayout from '../../../ui/BaseLayout.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { sidebar: 'story-themed-sidebar', main: 'story-themed-main' }

const template = `
	<div style="--rise-layout-sidebar-width: 240px; --rise-layout-sidebar-bg: var(--rise-bg-muted); --rise-layout-gap: 16px;">
		<BaseLayout v-bind="args" :ui="ui">
			<template #sidebar>
				<nav aria-label="Разделы" class="story-stack" style="padding: 16px">
					<BaseLink v-for="section in sections" :key="section" :href="'#' + section">{{ section }}</BaseLink>
				</nav>
			</template>
			<div style="padding: 24px">
				<h1 style="margin-top: 0">Заказы</h1>
				<p>Меню шире и на приглушённом фоне, между меню и содержимым — промежуток.</p>
			</div>
		</BaseLayout>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['hasSkipLink', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-layout-*` кит только читает: `bg` (фон каркаса), `gap` (промежуток меню и содержимого),',
					'`sidebar-width`, `sidebar-bg`, а также ссылка «Перейти к содержимому»: `skip-link-bg`, `skip-link-text`, `skip-link-radius`,',
					'`skip-link-shadow`, `skip-link-padding-x`, `skip-link-padding-y` — задайте их на `:root`, в теме или на обёртке.',
					'По умолчанию фон и промежуток пустые, ширина меню — по содержимому. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `skip-link`, `header`, `body`, `sidebar`, `content`, `main`, `footer`);',
					'глобально — `defaults.BaseLayout.ui` плагина. Каркас на странице один (один `<main>`) — здесь токены и классы на одном экземпляре,',
					'вид по умолчанию — в истории Default.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseLayout', 'BaseLink'],
				script: [`const sections = ${literal(SECTIONS)}`, `const ui = ${literal(ui)}`].join('\n'),
			}),
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseLayout, BaseLink },
		setup: useStorySetup(args, { data: { sections: SECTIONS, ui } }),
		template,
	}),
	play: async ({ canvasElement, canvas }) => {
		const sidebar = canvasElement.querySelector<HTMLElement>('.base-layout__sidebar')!
		const body = canvasElement.querySelector<HTMLElement>('.base-layout__body')!

		await expect(getComputedStyle(sidebar).width).toBe('240px')
		await expect(getComputedStyle(sidebar).backgroundColor).not.toBe(getComputedStyle(body).backgroundColor)
		await expect(getComputedStyle(body).columnGap).toBe('16px')
		await expect(sidebar).toHaveClass('base-layout__sidebar', 'story-themed-sidebar')
		await expect(canvas.getByRole('main')).toHaveClass('base-layout__main', 'story-themed-main')
	},
}
