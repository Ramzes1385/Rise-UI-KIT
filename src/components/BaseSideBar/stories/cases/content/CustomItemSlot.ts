import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { BASIC_ITEMS, SLOT_KEYS, FRAME_STYLE } from '../../shared'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const frameStyle = FRAME_STYLE

const models = { isCollapsed: 'isCollapsed' }

const template = `
	<div :style="frameStyle">
		<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed">
			<template #item="{ item, isCurrent }">
				<BaseIcon :name="item.icon" />
				<span style="flex: 1;">{{ item.label }}</span>
				<small v-if="isCurrent">открыто</small>
			</template>
		</BaseSideBar>
	</div>
`

export const CustomItemSlot: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Слот `item` заменяет содержимое пункта (параметры: `item`, `level`, `isActive`, `isCurrent`, `isCollapsed`, `hasChildren`).',
			},
			source: storySource({
				template,
				imports: ['BaseSideBar', 'BaseIcon'],
				script: `const frameStyle = ${literal(frameStyle)}`,
				models,
				omit: SLOT_KEYS,
			}),
		},
	},
	args: { items: BASIC_ITEMS, activePath: '/inbox' },
	render: args => ({
		components: { BaseSideBar, BaseIcon },
		setup: useStorySetup(args, { models, data: { frameStyle }, slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: /Входящие/ })).toHaveTextContent('открыто')
	},
}
