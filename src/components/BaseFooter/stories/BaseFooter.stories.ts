/**
 * BaseFooter — stories.
 *
 * Разделы: Default (песочница) → варианты.
 */

import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import { CONTAINER_SIZES } from '@components/BaseContainer'
import { ARG_GROUP, baseArgTypes, propGroup, useArgsWithoutSlots } from '@/stories/helpers'
import BaseFooter from '../ui/BaseFooter.vue'
import { FOOTER_VARIANTS } from '../model/BaseFooter.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

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

const meta = {
	title: 'Layout/BaseFooter',
	component: BaseFooter,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: [
					'Подвал сайта или приложения: копирайт, ссылки на документы, соцсети.',
					'',
					'- `<footer>` вне `<main>` — ориентир `contentinfo`: скринридер переходит к нему одной командой.',
					'- Слоты `start`, default и `end` — начало, середина и конец; на экране уже 768px зоны встают столбиком.',
					'- `containerSize` — ширина содержимого, как у BaseContainer; `variant` — `default` (линия сверху), `soft`, `ghost`.',
					'',
					'В каркасе страницы подвал кладут в слот `footer` у BaseLayout: он прижат к низу окна даже на короткой странице.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: FOOTER_VARIANTS }),
		containerSize: { control: 'inline-radio', options: CONTAINER_SIZES, table: propGroup(ARG_GROUP.appearance) },
	},
	args: {
		variant: 'default',
		containerSize: 'full',
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseFooter, BaseLink },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: TEMPLATE,
	}),
} satisfies Meta<typeof BaseFooter>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: копирайт, ссылки и подпись. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('contentinfo')).toBeVisible()
		await expect(canvas.getByRole('navigation', { name: 'Документы' })).toBeVisible()
	},
}

// ─── Варианты ──────────────────────────────────────────────────────────────────

/**
 * `default` — линия сверху, `soft` — приглушённый фон, `ghost` — прозрачный подвал. Подвалы в `<section>`: на странице
 * должен быть один ориентир contentinfo.
 */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale', 'containerSize'] } },
	render: args => ({
		components: { BaseFooter, BaseLink },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant']), variants: FOOTER_VARIANTS }),
		template: `
			<div class="story-stack" style="gap: 24px">
				<section v-for="variant in variants" :key="variant" :aria-label="'Подвал ' + variant">
					<BaseFooter v-bind="props" :variant="variant">
						<template #start>{{ variant }}</template>
						<BaseLink href="#help">Помощь</BaseLink>
					</BaseFooter>
				</section>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('.base-footer--soft')).toBeVisible()
	},
}
