import type { SearchArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Поле поиска с подсказками: результаты фильтруются по названию и описанию, совпадения выделены.',
				'',
				'- Режимы (`mode`): `default` — список под полем; `modal` — окно поиска по центру экрана;',
				'  `sidebar` — панель справа. В modal и sidebar поле на странице только открывает окно.',
				'- `isInstant` — искать при вводе (событие `search` с задержкой `debounceMs`), иначе — по Enter.',
				'- `isRemote` — результаты уже отфильтрованы сервером и показываются как есть (транслит, опечатки).',
				'- Клавиатура: стрелки подсвечивают результат, Enter выбирает его (или запускает поиск), Escape закрывает окно.',
				'',
				'Для выбора из фиксированного списка используйте `BaseSelect` с `isSearchable`.',
			].join('\n'),
		},
	},
} satisfies Meta<SearchArgs>['parameters']
