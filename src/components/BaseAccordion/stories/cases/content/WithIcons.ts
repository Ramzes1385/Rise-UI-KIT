import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseAccordionItem } from '../../../types/BaseAccordion.types'

const ICON_ITEMS: BaseAccordionItem[] = [
	{ label: 'Документы', icon: 'file', content: 'Договор, счёт и акт доступны в личном кабинете.', defaultOpen: true },
	{ label: 'Календарь поставок', icon: 'calendar', content: 'Отгрузки по вторникам и пятницам.' },
	{ label: 'Адрес склада', icon: 'pin', content: 'Москва, Складская улица, 12, ворота 3.' },
]

export const WithIcons: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Иконка перед заголовком — поле `icon` (имя из спрайта).' } } },
	args: { items: ICON_ITEMS },
}
