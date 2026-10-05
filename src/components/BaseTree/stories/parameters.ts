import { source } from './render'
import type BaseTree from '../ui/BaseTree.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Дерево показывает иерархию: файлы и папки, разделы каталога, структуру организации.',
				'',
				'- Узлы задаёт `items` (`id`, `label`, `icon`, `children`, `isDisabled`, `to`/`href`); дочерние узлы монтируются при первом раскрытии.',
				'- Раскрытие — клик по узлу или шеврону, стрелки ←/→, Enter; `v-model:expanded-ids`, `isDefaultExpandAll` — всё раскрыто сразу.',
				'- Выбор: `selectionMode` `single` — один узел, `multiple` — чекбоксы с каскадом по доступным узлам и частичным выбором папки; `v-model:selected-ids`.',
				'- Узел с `to` или `href` — ссылка (BaseLink): маршрут открывает RouterLink приложения, внешний адрес — `<a>`.',
				'- Слоты `icon`, `label`, `arrow` меняют части строки, `actions` — кнопки справа (видны при наведении и фокусе; в порядке Tab — только у текущего узла).',
				'- Клавиатура по образцу APG Tree View: в порядке Tab один узел, по дереву — стрелки, Home/End, `*` и буквы. Имя дерева — `ariaLabel`.',
				'- Строки 32px как пункты меню; уровень — отступ 20px с направляющей линией.',
				'- Перекраска — токены `--rise-tree-*`, классы частей — проп `ui` (история «Токены»); раскрытие ветки — `expand-rows`',
				'  на токенах движения, первое раскрытие без рывка (история «Анимации»).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseTree>['parameters']
