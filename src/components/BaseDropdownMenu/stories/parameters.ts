import type { Meta } from '@storybook/vue3-vite'
import type BaseDropdownMenu from '../ui/BaseDropdownMenu.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Меню у кнопки по паттерну APG Menu Button: действия, флажки, переключатели, подменю, ссылки.',
				'',
				'- Кнопка — слот по умолчанию. Кит ставит ей `aria-haspopup="menu"`, `aria-expanded` и `aria-controls`',
				'  сам; `triggerProps` из слота нужен, если кнопка вложена глубже.',
				'- Клавиатура: Enter, Space и стрелка вниз на кнопке открывают меню на первом пункте, стрелка вверх —',
				'  на последнем. В меню стрелки ходят по пунктам по кругу, Home/End — первый и последний, буквы — поиск',
				'  по началу подписи, стрелка вправо открывает подменю, влево — закрывает. Escape закрывает верхнее меню',
				'  и возвращает фокус; Tab из меню не уходит.',
				'- Обычный пункт закрывает меню. Флажок и переключатель по клику и Space остаются открытыми, по Enter — закрывают.',
				'  Состояние отметок хранит приложение: `isChecked` у пункта и `onUpdateChecked`.',
				'- Пункт с `to` или `href` — ссылка (BaseLink). `isDanger` — цвет ошибки для необратимых действий.',
				'- Панель — BaseDropdown: варианты, переворот у края окна, стек слоёв и тема блока — как у неё.',
				'',
				'Меню по правому клику — `BaseContextMenu`, вопрос перед действием — `BasePopconfirm`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseDropdownMenu>['parameters']
