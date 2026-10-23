import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'
import type { BreadcrumbItem } from '../../../types/BaseBreadcrumbs.types'

const ICON_ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/', icon: 'home' },
	{ label: 'Документы', to: '/docs', icon: 'folder' },
	{ label: 'Договор поставки.pdf', icon: 'file' },
]

export const WithIcons: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Иконки у крошек задаёт поле `icon` (имя из спрайта).' } } },
	args: { items: ICON_ITEMS },
}
