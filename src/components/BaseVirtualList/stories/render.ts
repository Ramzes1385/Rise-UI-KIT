import { ROW_STYLE } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import BaseVirtualList from '../ui/BaseVirtualList.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import type { BaseVirtualListProps } from '../types/BaseVirtualList.types'

export const render = (args => ({
	components: { BaseVirtualList },
	setup: () => ({ props: useArgsWithoutSlots(args), rowStyle: ROW_STYLE }),
	template: `
			<BaseVirtualList v-bind="props" style="max-width: 480px; border: 1px solid var(--rise-border); border-radius: 8px">
				<template #default="{ item }">
					<div :style="rowStyle">
						<span>{{ item.title }}</span>
						<span style="color: var(--rise-text-muted)">{{ item.city }}</span>
						<strong>{{ item.total }}</strong>
					</div>
				</template>
			</BaseVirtualList>
		`,
})) satisfies Meta<BaseVirtualListProps<Record<string, unknown>>>['render']
