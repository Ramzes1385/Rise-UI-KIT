import { expect } from 'storybook/test'
import type meta from '../../BaseSideBar.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { BASIC_ITEMS, SLOT_KEYS, FRAME_STYLE } from '../../shared'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const NavigationSlot: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Слот `navigation` заменяет навигацию из `items` в раскрытой панели — для полностью своей разметки.' },
		},
	},
	args: { items: BASIC_ITEMS },
	render: args => {
		const onUpdate = useModelArg('isCollapsed')
		return {
			components: { BaseSideBar, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate, frameStyle: FRAME_STYLE }),
			template: `
				<div :style="frameStyle">
					<BaseSideBar v-bind="props" @update:is-collapsed="onUpdate">
						<template #navigation>
							<div class="story-col">
								<BaseButton variant="ghost">Кастомная главная</BaseButton>
								<BaseButton variant="ghost">Кастомный каталог</BaseButton>
							</div>
						</template>
					</BaseSideBar>
				</div>
			`,
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Кастомная главная' })).toBeVisible()
		await expect(canvas.queryByRole('link', { name: 'Главная' })).toBeNull()
	},
}
