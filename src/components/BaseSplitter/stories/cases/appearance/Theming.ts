import { expect } from 'storybook/test'
import type meta from '../../BaseSplitter.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSplitter from '../../../ui/BaseSplitter.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { pane: 'story-themed-pane', handle: 'story-themed-handle' }

const template = `
	<div class="story-stack">
		<div style="height: 120px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
			<BaseSplitter v-bind="args" label="По умолчанию">
				<template #start><p style="margin: 12px 16px">Письма</p></template>
				<template #end><p style="margin: 12px 16px">Письмо</p></template>
			</BaseSplitter>
		</div>
		<div style="height: 120px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden; --rise-splitter-separator-width: 13px; --rise-splitter-separator-bg: var(--rise-border-accented); --rise-splitter-handle-bg: var(--rise-primary); --rise-splitter-handle-width: 6px; --rise-splitter-handle-height: 40px; --rise-splitter-handle-radius: var(--rise-radius-sm);">
			<BaseSplitter v-bind="args" label="Токены на контейнере">
				<template #start><p style="margin: 12px 16px">Письма</p></template>
				<template #end><p style="margin: 12px 16px">Письмо</p></template>
			</BaseSplitter>
		</div>
		<div style="height: 120px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
			<BaseSplitter v-bind="args" label="Классы через ui" :ui="ui">
				<template #start><p style="margin: 12px 16px">Письма</p></template>
				<template #end><p style="margin: 12px 16px">Письмо</p></template>
			</BaseSplitter>
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'orientation', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-splitter-*` кит только читает: `separator-width` (толщина зоны захвата),',
					'`separator-bg`, `separator-bg-hover` (наведение и фокус), `separator-bg-active` (перетаскивание), `separator-ring` (кольцо фокуса),',
					'`handle-bg`, `handle-bg-hover`, `handle-bg-active`, `handle-radius`, `handle-width` (толщина ручки), `handle-height` (длина ручки) —',
					'задайте их на `:root`, в теме или на обёртке. Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы',
					'к частям (`root`, `pane`, `separator`, `handle`); глобально — `defaults.BaseSplitter.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSplitter'], script: `const ui = ${literal(ui)}`, omit: ['label'] }),
		},
	},
	render: args => ({
		components: { BaseSplitter },
		setup: useStorySetup(args, { data: { ui }, slots: ['default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const [plain, themed, classed] = ['По умолчанию', 'Токены на контейнере', 'Классы через ui'].map(name =>
			canvas.getByRole('separator', { name }),
		)
		const handle = (separator: HTMLElement) => separator.querySelector<HTMLElement>('.base-splitter__handle')!

		await expect(getComputedStyle(handle(themed)).backgroundColor).not.toBe(getComputedStyle(handle(plain)).backgroundColor)
		await expect(themed.offsetWidth).toBeGreaterThan(plain.offsetWidth)
		await expect(handle(themed).offsetHeight).toBeGreaterThan(handle(plain).offsetHeight)
		if (!isStoryBranded()) await expect(plain.offsetWidth).toBe(9)
		if (!isStoryBranded()) await expect(themed.offsetWidth).toBe(13)
		await expect(handle(classed)).toHaveClass('base-splitter__handle', 'story-themed-handle')
		await expect(classed.previousElementSibling).toHaveClass('base-splitter__pane', 'story-themed-pane')
	},
}
