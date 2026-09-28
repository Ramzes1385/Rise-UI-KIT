import type { Meta } from '@storybook/vue3-vite'
import type BaseAutocomplete from '../ui/BaseAutocomplete.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Поле с подсказками: город, компания, тег из справочника. Список фильтруется по вводу, выбор — мышью или с клавиатуры.',
				'',
				'- По образцу APG Combobox: фокус остаётся в поле, ↓/↑ ведут по вариантам (`aria-activedescendant`), Enter выбирает,',
				'  Escape закрывает список, а при закрытом — очищает поле. Число найденного слышно из `role="status"`.',
				'- Текст без выбора из списка при выходе из поля заменяется выбранным значением; `isCustomAllowed` делает его значением (`normalize` — привести текст к значению).',
				'- `isRemote` + событие `search` — варианты с сервера без фильтрации, `isLoading` — «Загрузка…».',
				'- Слот `option` — своя разметка варианта; `filter` — своя фильтрация; `maxResults` — длина списка.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseAutocomplete>['parameters']
