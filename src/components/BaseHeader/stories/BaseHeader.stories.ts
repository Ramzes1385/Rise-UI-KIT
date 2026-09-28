/**
 * BaseHeader — stories.
 *
 * Разделы: Default (песочница) → варианты → меню для узкого экрана → клавиатура.
 */

import { expect, screen, waitFor, within } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import { BaseButton } from '@components/BaseButton'
import { DRAWER_DIRECTIONS } from '@components/BaseDrawer'
import { CONTAINER_SIZES } from '@components/BaseContainer'
import { ARG_GROUP, baseArgTypes, propGroup, tabTo, useArgsWithoutSlots } from '@/stories/helpers'
import BaseHeader from '../ui/BaseHeader.vue'
import { HEADER_VARIANTS } from '../model/BaseHeader.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const NAV = `
	<nav aria-label="Основное" class="story-row" style="gap: 20px">
		<BaseLink href="#orders">Заказы</BaseLink>
		<BaseLink href="#clients">Клиенты</BaseLink>
		<BaseLink href="#reports">Отчёты</BaseLink>
	</nav>
`

const meta = {
	title: 'Layout/BaseHeader',
	component: BaseHeader,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: [
					'Шапка сайта или приложения: название, основная навигация и действия.',
					'',
					'- `<header>` вне `<main>` — ориентир `banner`. `title` с `to` или `href` — ссылка на главную; слот `start` — логотип.',
					'- Слоты: default — навигация посередине, `end` — действия (поиск, тема, профиль).',
					'- Слот `menu` — меню для узкого экрана: ниже 768px навигация прячется, кнопка «Меню» (`aria-expanded`)',
					'  открывает его в BaseDrawer (`menuDirection`). Слот получает `close`, чтобы закрыть меню после перехода.',
					'- `isSticky` — прилипает к верху окна; `containerSize` — ширина содержимого, как у BaseContainer.',
					'- `variant`: `default` — линия снизу, `soft` — приглушённый фон, `ghost` — прозрачная (поверх обложки).',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: HEADER_VARIANTS }),
		title: { control: 'text', table: propGroup(ARG_GROUP.content) },
		href: { control: 'text', table: propGroup(ARG_GROUP.content) },
		containerSize: { control: 'inline-radio', options: CONTAINER_SIZES, table: propGroup(ARG_GROUP.appearance) },
		isSticky: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		menuLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
		menuDirection: { control: 'inline-radio', options: DRAWER_DIRECTIONS, table: propGroup(ARG_GROUP.behavior) },
	},
	args: {
		title: 'Rise CRM',
		href: '#home',
		variant: 'default',
		containerSize: 'full',
		isSticky: true,
		menuDirection: 'right',
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseHeader, BaseLink, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseHeader v-bind="props">
				${NAV}
				<template #end><BaseButton variant="outline">Войти</BaseButton></template>
			</BaseHeader>
		`,
	}),
} satisfies Meta<typeof BaseHeader>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: название-ссылка, навигация и кнопка входа. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('banner')).toBeVisible()
		await expect(canvas.getByRole('link', { name: 'Rise CRM' })).toHaveAttribute('href', '#home')
		await expect(canvas.getByRole('navigation', { name: 'Основное' })).toBeVisible()
	},
}

// ─── Варианты ──────────────────────────────────────────────────────────────────

/**
 * `default` — линия снизу, `soft` — приглушённый фон, `ghost` — прозрачная шапка. Шапки в `<section>`: на странице
 * должен быть один ориентир banner.
 */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale', 'containerSize'] } },
	render: args => ({
		components: { BaseHeader },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'title', 'isSticky']), variants: HEADER_VARIANTS }),
		template: `
			<div class="story-stack" style="gap: 24px">
				<section v-for="variant in variants" :key="variant" :aria-label="'Шапка ' + variant">
					<BaseHeader v-bind="props" :variant="variant" :title="variant" :is-sticky="false" />
				</section>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelectorAll('header')).toHaveLength(3)
	},
}

// ─── Меню для узкого экрана ────────────────────────────────────────────────────

/**
 * Слот `menu`: на экране уже 768px навигация прячется, а кнопка «Меню» открывает её в выдвижной панели.
 * Сузьте окно Storybook, чтобы увидеть кнопку; play открывает меню из кода на любой ширине.
 */
export const WithMenu: Story = {
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseHeader, BaseLink },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseHeader v-bind="props">
				${NAV}
				<template #menu="{ close }">
					<nav aria-label="Основное меню" class="story-stack">
						<BaseLink href="#orders" @click="close">Заказы</BaseLink>
						<BaseLink href="#clients" @click="close">Клиенты</BaseLink>
						<BaseLink href="#reports" @click="close">Отчёты</BaseLink>
					</nav>
				</template>
			</BaseHeader>
		`,
	}),
	play: async ({ canvasElement, userEvent }) => {
		const toggle = canvasElement.querySelector('.base-header__toggle') as HTMLButtonElement
		await expect(toggle).toHaveAttribute('aria-expanded', 'false')
		toggle.click()
		const dialog = await screen.findByRole('dialog', { name: 'Меню' })
		await expect(toggle).toHaveAttribute('aria-expanded', 'true')
		await userEvent.click(within(dialog).getByRole('link', { name: 'Клиенты' }))
		await waitFor(() => expect(dialog).not.toBeInTheDocument())
	},
}

// ─── Клавиатура ────────────────────────────────────────────────────────────────

/** Клавиатура: Tab идёт по названию, ссылкам навигации и действиям слева направо. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		await tabTo(canvas.getByRole('link', { name: 'Rise CRM' }), userEvent)
		await userEvent.tab()
		await expect(canvas.getByRole('link', { name: 'Заказы' })).toHaveFocus()
	},
}
