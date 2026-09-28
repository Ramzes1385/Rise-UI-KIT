import type BaseUser from '../ui/BaseUser.vue'
import { STORY_USERS } from '@/stories/helpers'
import type { Meta } from '@storybook/vue3-vite'

const [ANNA] = STORY_USERS

export const args = {
	name: ANNA.name,
	description: ANNA.role,
	src: ANNA.avatar,
	isOnline: false,
	orientation: 'horizontal',
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseUser>['args']
