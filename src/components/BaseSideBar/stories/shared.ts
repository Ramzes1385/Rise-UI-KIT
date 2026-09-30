import { STORY_USERS } from '@/stories/helpers'
import type { SideBarItem } from '../types/BaseSideBar.types'

export const BASIC_ITEMS: SideBarItem[] = [
	{ key: 'dashboard', label: 'Главная', icon: 'home', to: '/dashboard' },
	{ key: 'inbox', label: 'Входящие', icon: 'inbox', to: '/inbox', badge: 4 },
	{ key: 'calendar', label: 'Календарь', icon: 'calendar', to: '/calendar' },
]

export const USER = STORY_USERS[0]

export const FRAME_STYLE = 'display: flex; height: 520px;'

export const SLOT_KEYS = ['default', 'header', 'footer', 'navigation', 'collapsedContent', 'item', 'icon', 'label', 'badge']
