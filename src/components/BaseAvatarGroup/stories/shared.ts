import { STORY_USERS } from '@/stories/helpers'
import { WAVE_GIF } from '@components/BaseAvatar/stories/shared'
import type { AvatarGroupItem } from '../types/BaseAvatarGroup.types'

export const PEOPLE: AvatarGroupItem[] = [
	...STORY_USERS.map(user => ({ name: user.name, src: user.avatar })),
	{ name: 'Дмитрий Орлов' },
	{ name: 'Светлана Белова' },
]

export const MEDIA_PEOPLE: AvatarGroupItem[] = [
	{ name: STORY_USERS[0].name, src: STORY_USERS[0].avatar, ring: 'shimmer' },
	{ name: 'Гость', src: WAVE_GIF },
	{ name: 'Росток', mascot: 'sprout', ring: 'gradient' },
	{ name: STORY_USERS[1].name, src: STORY_USERS[1].avatar },
	{ name: 'Дмитрий Орлов', ring: 'gradient' },
	...STORY_USERS.slice(2).map(user => ({ name: user.name, src: user.avatar })),
]
