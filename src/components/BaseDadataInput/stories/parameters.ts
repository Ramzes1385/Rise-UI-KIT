import type { Meta } from '@storybook/vue3-vite'
import type BaseDadataInput from '../ui/BaseDadataInput.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Поле с подсказками DaData: адрес, организация или ИП, банк, ФИО, электронная почта (`kind`). Основа — BaseAutocomplete:',
				'список подсказок с ролью `listbox`, стрелки, Enter, Escape, объявление числа вариантов.',
				'',
				'- Ключ API — проп `token` или для всех полей настройка плагина `defaults: { BaseDadataInput: { token } }`. Ключ в браузере',
				'  виден всем: для открытого сайта задайте `baseUrl` своего прокси, который сам добавит ключ. `params` — прочие поля',
				'  запроса (`locations`, `status`, `type`).',
				'- Запрос уходит после паузы `debounce` (300 мс) и с `minChars` знаков (3); устаревший запрос отменяется через `AbortSignal`,',
				'  ошибка сервиса оставляет список пустым.',
				'- `select` — подсказка со всеми данными и реквизиты из неё (`inn`, `kpp`, `ogrn`, `bik`, `correspondentAccount`) для',
				'  BaseRequisiteInput; для адреса есть BaseAddressInput, у обоих основа — `createDadataSource` из `utils`.',
				'- Проверки: `isStrict` — только из подсказок, `precision` — адрес до города, улицы, дома или квартиры, у `party` и `bank`',
				'  запрос из цифр с неверным контрольным числом не уходит, у `email` — формат почты. Ошибки — после ухода из поля, итог —',
				'  событие `validate`, выбранная подсказка целиком — `v-model:suggestion`. Масок нет: поле ищет по свободному тексту.',
				'- `source` заменяет запросы к DaData своим источником. В этих историях подсказки — из демо-списка с задержкой 300 мс,',
				'  запросов к DaData нет.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseDadataInput>['parameters']
