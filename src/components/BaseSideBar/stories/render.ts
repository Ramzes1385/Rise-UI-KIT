import BaseSideBar from '../ui/BaseSideBar.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseAvatar } from '@components/BaseAvatar'
import { SLOT_KEYS, USER, FRAME_STYLE } from './shared'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const user = USER

const frameStyle = FRAME_STYLE

const models = { isCollapsed: 'isCollapsed' }

const template = `
	<div :style="frameStyle">
		<BaseSideBar v-bind="args" v-model:is-collapsed="isCollapsed">
			<template #footer>
				<div class="story-row" style="flex-wrap: nowrap; gap: 8px;">
					<BaseAvatar :src="user.avatar" :name="user.name" :size-scale="80" />
					<span v-if="!isCollapsed">{{ user.name }}</span>
				</div>
			</template>
		</BaseSideBar>
	</div>
`

export const source = storySource({
	template,
	imports: ['BaseSideBar', 'BaseAvatar'],
	models,
	script: [`const user = ${literal(user)}`, `const frameStyle = ${literal(frameStyle)}`].join('\n'),
	omit: [...SLOT_KEYS, 'linkComponent'],
})

export const render = (args => ({
	components: { BaseSideBar, BaseAvatar },
	setup: useStorySetup(args, { models, data: { user, frameStyle }, slots: SLOT_KEYS }),
	template,
})) satisfies Meta<typeof BaseSideBar>['render']
