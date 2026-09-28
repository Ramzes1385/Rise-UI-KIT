import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import { BaseFooter } from '@components/BaseFooter'
import { BaseHeader } from '@components/BaseHeader'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import BaseLayout from '../ui/BaseLayout.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const SECTIONS = ['Заказы', 'Клиенты', 'Склад', 'Отчёты', 'Настройки']

const ORDERS = Array.from({ length: 12 }, (_, index) => `Заказ № ${1040 + index} — ${index % 3 === 0 ? 'ждёт оплаты' : 'собран'}`)

function shell(content: string): string {
	return `
		<BaseLayout v-bind="props">
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
			<div style="padding: 24px">${content}</div>
			<template #footer>
				<BaseFooter><template #start>© 2026 Rise Studio</template></BaseFooter>
			</template>
		</BaseLayout>
	`
}

const meta = {
	title: 'Layout/BaseLayout',
	component: BaseLayout,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: [
					'Каркас страницы на всю высоту окна: шапка, боковое меню, основное содержимое и подвал.',
					'',
					'- Слоты: `header` (BaseHeader), `sidebar` (BaseSideBar или своя навигация), default — содержимое в `<main>`, `footer` (BaseFooter).',
					'- Первая остановка Tab — ссылка «Перейти к содержимому» (видна только в фокусе): переносит фокус в `<main>`',
					'  мимо шапки и меню (WCAG 2.4.1). Отключается `hasSkipLink`, текст — `skipLinkLabel`.',
					'- `isHeaderSticky` — шапка прилипает к верху, боковое меню встаёт под неё и прокручивается отдельно.',
					'- Подвал прижат к низу окна и на короткой странице.',
					'- На экране уже 768px боковое меню скрыто: положите ту же навигацию в слот `menu` у BaseHeader.',
					'  `isSidebarVisibleOnMobile` оставляет меню видимым.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant', 'color'),
		hasSkipLink: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		skipLinkLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
		mainId: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isHeaderSticky: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isSidebarVisibleOnMobile: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	},
	args: {
		hasSkipLink: true,
		isHeaderSticky: true,
		isSidebarVisibleOnMobile: false,
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseLayout, BaseHeader, BaseFooter, BaseLink },
		setup: () => ({ props: useArgsWithoutSlots(args), sections: SECTIONS, orders: ORDERS }),
		template: shell(`
			<h1 style="margin-top: 0">Заказы</h1>
			<p v-for="order in orders" :key="order">{{ order }}</p>
		`),
	}),
} satisfies Meta<typeof BaseLayout>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Каркас приложения: прокрутите страницу — шапка и меню остаются на месте. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('banner')).toBeVisible()
		await expect(canvas.getByRole('main')).toContainElement(canvas.getByRole('heading', { name: 'Заказы' }))
		await expect(canvas.getByRole('contentinfo')).toBeVisible()
		await expect(getComputedStyle(canvas.getByRole('banner').parentElement as HTMLElement).position).toBe('sticky')
	},
}

// ─── Короткая страница ─────────────────────────────────────────────────────────

/** Короткая страница: подвал всё равно внизу окна. */
export const ShortPage: Story = {
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseLayout, BaseHeader, BaseFooter, BaseLink },
		setup: () => ({ props: useArgsWithoutSlots(args), sections: SECTIONS }),
		template: shell('<h1 style="margin-top: 0">Отчёты</h1><p>Отчётов за сентябрь пока нет.</p>'),
	}),
	play: async ({ canvas }) => {
		const footer = canvas.getByRole('contentinfo')
		await expect(Math.round(footer.getBoundingClientRect().bottom)).toBe(window.innerHeight)
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: первый Tab — ссылка «Перейти к содержимому», Enter переносит фокус в `<main>`, следующий Tab — в содержимое. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseLayout, BaseHeader, BaseFooter, BaseLink },
		setup: () => ({ props: useArgsWithoutSlots(args), sections: SECTIONS }),
		template: shell('<h1 style="margin-top: 0">Клиенты</h1><BaseLink href="#new">Новый клиент</BaseLink>'),
	}),
	play: async ({ canvas, userEvent }) => {
		const skipLink = canvas.getByRole('link', { name: 'Перейти к содержимому' })
		await tabTo(skipLink, userEvent)
		await expect(skipLink).toBeVisible()
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('main')).toHaveFocus()
		await userEvent.tab()
		await expect(canvas.getByRole('link', { name: 'Новый клиент' })).toHaveFocus()
	},
}
