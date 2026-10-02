import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseTreeSelect from '../ui/BaseTreeSelect.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Выбор из иерархии в выпадающем списке: регион → город, отдел → сотрудник, категория → подкатегория.',
				'Поле выглядит как `BaseSelect` (32px), список — дерево в панели `BaseDropdown`.',
				'',
				'- `items` — узлы в формате `BaseTree` (`id`, `label`, `icon`, `children`, `isDisabled`); `v-model` — id узла.',
				'- `isMultiple` — флажки с каскадом: ветка выбирает доступных потомков, часть выбранных детей — частичный выбор;',
				'  вид значения задаёт `checkedStrategy` (`child` — листья, `parent` — ветка одним id, `all` — все узлы).',
				'- `isSearchable` — поиск по подписям: видны совпавшие узлы и их предки (раскрыты).',
				'- Доступность: поле — `combobox` с `aria-haspopup="tree"`, фокус остаётся в поле, активный узел —',
				'  `aria-activedescendant`. Стрелки вверх и вниз, Home и End — по строкам; вправо — раскрыть или к первому ребёнку,',
				'  влево — свернуть или к родителю; Enter (и пробел в поле) — выбрать; Escape, Tab и Alt+↑ — закрыть.',
				'',
				'Для плоского списка используйте `BaseSelect`, для дерева на странице — `BaseTree`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseTreeSelect>['parameters']
