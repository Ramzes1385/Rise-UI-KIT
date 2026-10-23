import type { Meta } from '@storybook/vue3-vite'
import { ROW_STYLE, ordersScript } from './shared'
import BaseVirtualList from '../ui/BaseVirtualList.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import type { BaseVirtualListProps } from '../types/BaseVirtualList.types'

const template = `
	<BaseVirtualList v-bind="args" :items="items" style="max-width: 480px; border: 1px solid var(--rise-border); border-radius: 8px">
		<template #default="{ item }">
			<div :style="rowStyle">
				<span>{{ item.title }}</span>
				<span style="color: var(--rise-text-muted)">{{ item.city }}</span>
				<strong>{{ item.total }}</strong>
			</div>
		</template>
	</BaseVirtualList>
`

export const source = storySource({ template, imports: ['BaseVirtualList'], script: ordersScript(10000), omit: ['items'] })

export const render = (args => ({
	components: { BaseVirtualList },
	setup: useStorySetup(args, { data: { items: args.items, rowStyle: ROW_STYLE }, slots: ['default', 'items'] }),
	template,
})) satisfies Meta<BaseVirtualListProps<Record<string, unknown>>>['render']
