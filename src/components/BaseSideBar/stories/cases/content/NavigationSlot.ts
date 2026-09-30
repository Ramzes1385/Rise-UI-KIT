import { expect } from 'storybook/test'
import type meta from '../../BaseSideBar.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { BASIC_ITEMS, SLOT_KEYS, FRAME_STYLE } from '../../shared'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const frameStyle = FRAME_STYLE

const models = { isCollapsed: 'isCollapsed' }

const template = `
	<div :style="frameStyle">
		<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed">
			<template #navigation>
				<div class="story-col">
					<BaseButton variant="ghost">Кастомная главная</BaseButton>
					<BaseButton variant="ghost">Кастомный каталог</BaseButton>
				</div>
			</template>
		</BaseSideBar>
	</div>
`

export const NavigationSlot: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Слот `navigation` заменяет навигацию из `items` в раскрытой панели — для полностью своей разметки.' },
			source: storySource({
				template,
				imports: ['BaseSideBar', 'BaseButton'],
				script: `const frameStyle = ${literal(frameStyle)}`,
				models,
				omit: SLOT_KEYS,
			}),
		},
	},
	args: { items: BASIC_ITEMS },
	render: args => ({
		components: { BaseSideBar, BaseButton },
		setup: useStorySetup(args, { models, data: { frameStyle }, slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Кастомная главная' })).toBeVisible()
		await expect(canvas.queryByRole('link', { name: 'Главная' })).toBeNull()
	},
}
