import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseSideBar.stories'
import { BaseAvatar } from '@components/BaseAvatar'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { BASIC_ITEMS, SLOT_KEYS, USER, FRAME_STYLE } from '../../shared'

const user = USER

const frameStyle = FRAME_STYLE

const models = { isCollapsed: 'isCollapsed' }

const template = `
	<div :style="frameStyle">
		<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed">
			<template #header>
				<div class="story-row" style="flex-wrap: nowrap; gap: 8px;">
					<BaseIcon name="star" />
					<strong>Rise Studio</strong>
				</div>
			</template>
			Свободное место: 2,4 ГБ из 10 ГБ
			<template #footer>
				<div class="story-row" style="flex-wrap: nowrap; gap: 8px;">
					<BaseAvatar :src="user.avatar" :name="user.name" :size-scale="80" />
					<span v-if="!isCollapsed">{{ user.name }}</span>
				</div>
			</template>
		</BaseSideBar>
	</div>
`

export const WithSlots: StoryObj<typeof meta> = {
	args: { items: BASIC_ITEMS, activePath: '/inbox' },
	parameters: {
		docs: {
			description: {
				story: [
					'Слоты панели: `header` заменяет заголовок, слот по умолчанию — тело под навигацией, `footer` — подвал,',
					'`collapsedContent` — содержимое свёрнутой панели.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSideBar', 'BaseAvatar', 'BaseIcon'],
				script: [`const user = ${literal(user)}`, `const frameStyle = ${literal(frameStyle)}`].join('\n'),
				models,
				omit: SLOT_KEYS,
			}),
		},
	},
	render: args => ({
		components: { BaseSideBar, BaseAvatar, BaseIcon },
		setup: useStorySetup(args, { models, data: { user, frameStyle }, slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Rise Studio')).toBeVisible()
		await expect(canvas.getByText('Свободное место: 2,4 ГБ из 10 ГБ')).toBeVisible()
	},
}
