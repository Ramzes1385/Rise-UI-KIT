import { STORY_USERS } from '@/stories/helpers'
import type { AvatarGroupItem } from '../types/BaseAvatarGroup.types'

export const PEOPLE: AvatarGroupItem[] = [
	...STORY_USERS.map(user => ({ name: user.name, src: user.avatar })),
	{ name: 'Дмитрий Орлов' },
	{ name: 'Светлана Белова' },
]
