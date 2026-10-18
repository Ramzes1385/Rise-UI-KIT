import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseRoadmap from '../ui/BaseRoadmap.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Роадмап показывает путь обучения или развития: этапы по порядку, в каждом — темы с подтемами, материалами и оценкой в часах.',
				'Прогресс ведёт ученик: данные (`data`) пишет автор, прогресс (`progress`) хранится отдельно — в `v-model:progress` или в `storage`.',
				'',
				'- Раскладки: `path` — вертикальный хребет, темы ветками (по умолчанию); `snake` — дорога рядами; `horizontal` — лента',
				'  слева направо; `list` — этапы аккордеоном. Переключатель — `hasLayoutSwitch`, в узком контейнере (`narrowWidth`) — `narrowLayout`.',
				'- Темы закрыты, пока не пройдены `requires`; группа `choice` — «или»: этапу хватает одной темы; `kind: "optional"` — «По желанию».',
				'- Панель темы: справа (`side`) или нижней шторкой (`sheet`); подтемы — флажки, статус — кнопка «Отметить изученной».',
				'- `beforeStatusChange` отменяет или откладывает смену статуса (подтверждение, запрос на сервер), `storage` сохраняет прогресс',
				'  (`createLocalStorageProgress`), ошибки — событие `progress-error`.',
				'- Клавиатура: Tab по порядку DOM, этап — кнопка-раскрытие (`aria-expanded`), тема — кнопка, Escape закрывает боковую панель.',
				'  Статус темы продублирован текстом для скринридера, смены статуса объявляются в `aria-live`.',
				'- Перекраска — токены `--rise-roadmap-*`, классы частей — проп `ui`; RTL зеркалит хребет, ветки и панель.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseRoadmap>['parameters']
