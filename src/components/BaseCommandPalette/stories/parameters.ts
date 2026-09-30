import type { Meta } from '@storybook/vue3-vite'
import type BaseCommandPalette from '../ui/BaseCommandPalette.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Палитра команд: окно с поиском по командам приложения, открывается по ⌘K (Ctrl+K на Windows и Linux).',
				'',
				'- `commands` — команды с группой, пояснением, значком, сочетанием для подсказки и словами для поиска;',
				'  `onSelect` команды выполняется после закрытия, событие `select` приходит всегда.',
				'- Поиск — по названию, группе, пояснению и `keywords`, без учёта регистра и «ё»; все слова запроса должны найтись.',
				'- Клавиатура по образцу APG Combobox: ↑/↓ — команда, Home/End — первая и последняя, Enter — выполнить,',
				'  Escape — закрыть; фокус остаётся в поле, выбранная команда — через `aria-activedescendant`.',
				'- `hotkey` — своё сочетание (`mod+p`) или `null`. Сочетания работают и в русской раскладке: буквы',
				'  сравниваются по клавише. Для своих горячих клавиш — composable `useHotkeys`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseCommandPalette>['parameters']
