import { STORY_USERS } from '@/stories/helpers'
import type { MentionOption } from '../types/BaseMention.types'

const HANDLES = ['anna', 'ivan', 'maria', 'oleg', 'kate'] as const

export const TEAM: MentionOption[] = STORY_USERS.map((user, index) => ({
	value: HANDLES[index],
	label: user.name,
	description: user.role,
	avatar: index < 3 ? user.avatar : undefined,
}))
