import { expect } from 'storybook/test'
import type meta from '../BaseSideBar.stories'
import { BaseIcon } from '@components/BaseIcon'
import BaseSideBar from '../../ui/BaseSideBar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { BASIC_ITEMS, SLOT_KEYS, FRAME_STYLE } from '../shared'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const CustomItemSlot: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Слот `item` заменяет содержимое пункта (параметры: `item`, `level`, `isActive`, `isCurrent`, `isCollapsed`, `hasChildren`).',
			},
		},
	},
	args: { items: BASIC_ITEMS, activePath: '/inbox' },
	render: args => {
		const onUpdate = useModelArg('isCollapsed')
		return {
			components: { BaseSideBar, BaseIcon },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate, frameStyle: FRAME_STYLE }),
			template: `
				<div :style="frameStyle">
					<BaseSideBar v-bind="props" @update:is-collapsed="onUpdate">
						<template #item="{ item, isCurrent }">
							<BaseIcon :name="item.icon" />
							<span style="flex: 1;">{{ item.label }}</span>
							<small v-if="isCurrent">открыто</small>
						</template>
					</BaseSideBar>
				</div>
			`,
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: /Входящие/ })).toHaveTextContent('открыто')
	},
}
