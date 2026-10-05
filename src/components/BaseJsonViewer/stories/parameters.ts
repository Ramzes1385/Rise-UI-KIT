import type { Meta } from '@storybook/vue3-vite'
import type BaseJsonViewer from '../ui/BaseJsonViewer.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Просмотр JSON деревом: ответы API, настройки, журналы событий. Объекты и массивы раскрываются, у свёрнутого —',
				'сводка «3 ключа» или «2 элемента», значения окрашены по типу: строки, числа, логические значения и null.',
				'',
				'- Дерево — BaseTree по образцу APG Tree View: одна точка Tab, стрелки, Home/End, Enter и Space, поиск по буквам;',
				'  имя дерева для скринридера — `label`.',
				'- `expandDepth` — сколько уровней раскрыто при показе (по умолчанию 1), панель — «Развернуть всё»,',
				'  «Свернуть всё» и «Копировать JSON» (событие `copy`); `hasToolbar: false` убирает панель, слот `actions` — свои кнопки.',
				'- Путь узла (`$.customer.name`, `$.items[0]`) — id узла BaseTree.',
				'- Перекраска — токены `--rise-json-viewer-*`, классы частей — проп `ui` (история «Токены»); раскрытие узлов — движение',
				'  BaseTree на токенах (история «Анимации»).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseJsonViewer>['parameters']
