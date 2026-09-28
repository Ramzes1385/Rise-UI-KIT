import { ITEMS } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseAccordionItem } from '../../types/BaseAccordion.types'

const LONG_ITEMS: BaseAccordionItem[] = [
	{
		label: 'Какие документы нужны для оформления юридическим лицом с отсрочкой платежа и доставкой в регионы?',
		content: [
			'Понадобятся карточка организации с реквизитами, доверенность на получение товара и подписанный договор поставки.',
			'Для отсрочки платежа дополнительно запросим бухгалтерскую отчётность за последний год и справку об отсутствии',
			'задолженности. Доставка в регионы оформляется через транспортную компанию, накладную пришлём после отгрузки.',
		].join(' '),
		defaultOpen: true,
	},
	ITEMS[1],
]

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Длинные заголовки и текст переносятся по словам; шеврон остаётся справа по центру заголовка.' } },
	},
	args: { items: LONG_ITEMS },
	play: async ({ canvas }) => {
		const header = canvas.getByRole('button', { name: /Какие документы нужны/ })
		await expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth)
	},
}
