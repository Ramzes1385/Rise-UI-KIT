import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCascader from '../ui/BaseCascader.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Выбор из иерархии уровнями-колонками: регион → город → район. Поле выглядит как `BaseSelect`, панель — `BaseDropdown`.',
				'',
				"- `v-model` — путь id от корня (`['msk-region', 'cao', 'tverskoy']`), в поле — подписи пути через `separator`;",
				'  `isMultiple` — список путей, выбранные — метками; `isAnyLevel` — можно выбрать узел любого уровня.',
				'- `load(node)` — промис детей уровня: колонка показывает загрузку, при ошибке — «Повторить»; результат запоминается.',
				'- `isSearchable` — поиск по подписям всех загруженных уровней, результаты — пути списком.',
				'- Доступность: поле — `combobox`, каждая колонка — `listbox` с именем родителя; стрелки вверх и вниз — по колонке,',
				'  вправо и влево — между колонками, Enter — выбрать или раскрыть, Escape и Tab — закрыть.',
				'',
				'Плоский список — `BaseSelect`, дерево с флажками и частичным выбором — `BaseTree`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseCascader>['parameters']
