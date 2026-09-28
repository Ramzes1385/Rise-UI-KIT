import { expect } from 'storybook/test'
import type meta from '../BaseMegaMenu.stories'
import BaseMegaMenu from '../../ui/BaseMegaMenu.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import type { MegaMenuColumn } from '../../types/BaseMegaMenu.types'

const LONG_COLUMNS: MegaMenuColumn[] = [
	{
		title: 'Услуги для корпоративных клиентов и государственных учреждений',
		items: [
			{
				label: 'Комплексное сопровождение закупок по 44-ФЗ и 223-ФЗ',
				description: 'Подготовка документации, участие в торгах и контроль исполнения контрактов',
				to: '/services/procurement',
			},
			{ label: 'Аудит информационной безопасности', to: '/services/audit' },
		],
	},
]

export const LongContent: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Длинные заголовки, названия и описания переносятся по словам внутри колонки.' } } },
	args: { columns: LONG_COLUMNS },
	render: args => ({
		components: { BaseMegaMenu },
		setup: () => ({ props: useArgsWithoutSlots(args, ['column-title', 'nav-item', 'item']) }),
		template: '<div class="story-narrow"><BaseMegaMenu v-bind="props" /></div>',
	}),
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: /Комплексное сопровождение/ })
		await expect(link.scrollWidth).toBeLessThanOrEqual(link.clientWidth)
	},
}
