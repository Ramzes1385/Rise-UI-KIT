import BaseSideBar from '../ui/BaseSideBar.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseAvatar } from '@components/BaseAvatar'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'
import { SLOT_KEYS, USER, FRAME_STYLE, PROFILE_FOOTER } from './shared'

export const render = (args => {
	const onUpdate = useModelArg('isCollapsed')
	return {
		components: { BaseSideBar, BaseAvatar },
		setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate, user: USER, frameStyle: FRAME_STYLE }),
		template: `
				<div :style="frameStyle">
					<BaseSideBar v-bind="props" @update:is-collapsed="onUpdate">${PROFILE_FOOTER}</BaseSideBar>
				</div>
			`,
	}
}) satisfies Meta<typeof BaseSideBar>['render']
