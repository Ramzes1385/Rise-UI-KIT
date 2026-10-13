import { expect } from 'storybook/test'
import { SMALL_LAYOUT } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDashboardGrid.stories'
import BaseDashboardGrid from '../../../ui/BaseDashboardGrid.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-grid', item: 'story-themed-item' }

const template = `
	<div class="story-stack">
		<BaseDashboardGrid v-bind="args" :layout="layout" :cols="4" :row-height="48" label="По умолчанию">
			<template #item="{ item }">
				<strong>{{ item.label }}</strong>
			</template>
		</BaseDashboardGrid>
		<div style="--rise-dashboard-grid-bg: var(--rise-success-soft); --rise-dashboard-grid-text: var(--rise-success-text); --rise-dashboard-grid-border: var(--rise-success-border); --rise-dashboard-grid-radius: var(--rise-radius-xl); --rise-dashboard-grid-shadow: var(--rise-shadow-md); --rise-dashboard-grid-padding-x: 24px; --rise-dashboard-grid-padding-y: 20px;">
			<BaseDashboardGrid v-bind="args" :layout="layout" :cols="4" :row-height="64" label="Токены на контейнере">
				<template #item="{ item }">
					<strong>{{ item.label }}</strong>
				</template>
			</BaseDashboardGrid>
		</div>
		<BaseDashboardGrid v-bind="args" :layout="layout" :cols="4" :row-height="48" label="Классы через ui" :ui="ui">
			<template #item="{ item }">
				<strong>{{ item.label }}</strong>
			</template>
		</BaseDashboardGrid>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { layout: SMALL_LAYOUT },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-dashboard-grid-*` кит только читает: `bg`, `text`, `border`, `radius`, `shadow`, `shadow-active`',
					'(тень переносимого виджета), `padding-x`, `padding-y` — задайте их на `:root`, в теме или на контейнере, как здесь.',
					'Отступы внутри виджета умножаются на плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к частям (`root`, `item`, `body`, `handle`, `resize`, `placeholder`, `empty`, `status`, `hint`);',
					'глобально — `defaults.BaseDashboardGrid.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseDashboardGrid'],
				script: `const ui = ${literal(ui)}\n\nconst layout = ${literal(SMALL_LAYOUT)}`,
				omit: ['layout'],
			}),
		},
	},
	render: args => ({
		components: { BaseDashboardGrid },
		setup: useStorySetup(args, { data: { ui, layout: SMALL_LAYOUT } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getAllByRole('group', { name: 'Выручка' })[0]
		const themed = canvas.getAllByRole('group', { name: 'Выручка' })[1]
		const classed = canvas.getByRole('group', { name: 'Классы через ui' })

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).boxShadow).not.toBe('none')
		await expect(getComputedStyle(plain).boxShadow).toBe('none')
		if (!isStoryBranded()) {
			const body = (element: HTMLElement): HTMLElement => element.querySelector('.base-dashboard-grid__body') as HTMLElement
			await expect(getComputedStyle(body(themed)).paddingTop).toBe('20px')
			await expect(getComputedStyle(body(plain)).paddingTop).toBe('16px')
		}
		await expect(classed).toHaveClass('base-dashboard-grid', 'story-themed-grid')
		await expect(classed.querySelector('.base-dashboard-grid__item')).toHaveClass('story-themed-item')
	},
}
