import { expect } from 'storybook/test'
import type meta from '../BaseVirtualList.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseVirtualList from '../../ui/BaseVirtualList.vue'
import { ORDERS, ROW_STYLE, ordersScript } from '../shared'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-list', item: 'story-themed-item' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px; align-items: start;">
		<BaseVirtualList v-bind="args" :items="items">
			<template #default="{ item }">
				<div :style="rowStyle">{{ item.title }}</div>
			</template>
		</BaseVirtualList>
		<div style="--rise-virtual-list-bg: var(--rise-bg-elevated); --rise-virtual-list-radius: var(--rise-radius-xl); --rise-virtual-list-item-padding-x: 8px; --rise-virtual-list-item-padding-y: 2px;">
			<BaseVirtualList v-bind="args" :items="items">
				<template #default="{ item }">
					<div :style="rowStyle">{{ item.title }}</div>
				</template>
			</BaseVirtualList>
		</div>
		<BaseVirtualList v-bind="args" :items="items" :ui="ui">
			<template #default="{ item }">
				<div :style="rowStyle">{{ item.title }}</div>
			</template>
		</BaseVirtualList>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { items: ORDERS.slice(0, 100), height: 200 },
	parameters: {
		controls: { include: ['height', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Своего вида у списка почти нет —',
					'строки рисует слот, поэтому токенов четыре: `--rise-virtual-list-bg` и `--rise-virtual-list-radius` области,',
					'`--rise-virtual-list-item-padding-x` и `--rise-virtual-list-item-padding-y` строки (отступ учитывается при замере).',
					'Кит их только читает — задайте на `:root`, в теме или на контейнере. Проп `ui` добавляет классы к частям `root`,',
					'`inner`, `item`; глобально — `defaults.BaseVirtualList.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseVirtualList'],
				script: [ordersScript(100), `const ui = ${literal(ui)}`].join('\n'),
				omit: ['items'],
			}),
		},
	},
	render: args => ({
		components: { BaseVirtualList },
		setup: useStorySetup(args, { data: { items: args.items, rowStyle: ROW_STYLE, ui }, slots: ['default', 'items'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-virtual-list')]
		const item = (list: HTMLElement) => getComputedStyle(list.querySelector('.base-virtual-list__item')!)

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('12px')
		await expect(item(themed).paddingLeft).toBe('8px')
		await expect(item(plain).paddingLeft).toBe('0px')
		await expect(classed).toHaveClass('base-virtual-list', 'story-themed-list')
		await expect(classed.querySelector('.base-virtual-list__item')).toHaveClass('story-themed-item')
	},
}
