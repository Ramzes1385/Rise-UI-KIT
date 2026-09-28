import type BaseMenu from '../ui/BaseMenu.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Панель пунктов-действий: контекстное меню файла, меню «ещё» в карточке, список команд.',
				'Кладите её в выпадающую панель (`BaseDropdown`, `BasePopover`) или показывайте на странице.',
				'',
				'- `items` — массив групп: `BaseMenuItem[][]`. Между группами — разделитель; `hasDivider` добавляет линию после пункта.',
				'- Клик, Enter или Space по пункту вызывают его `click()` и событие `select(item)`; отключённый пункт не реагирует.',
				'- Пункты — кнопки (`role="button"`), каждый доступен по Tab. Стрелочной навигации APG Menu нет.',
				'- Ширину задаёт контейнер; минимальная — 180px.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseMenu>['parameters']
