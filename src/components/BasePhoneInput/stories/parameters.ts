import type { Meta } from '@storybook/vue3-vite'
import type BasePhoneInput from '../ui/BasePhoneInput.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Поле телефона: выбор страны слева и маска национального номера. `v-model` — номер в международном формате',
				'без пробелов (`+79161234567`), `v-model:country` — код страны ISO (`RU`).',
				'',
				'- Страны — `PHONE_COUNTRIES` (Россия, СНГ и частые направления) или свои `countries`: `{ code, dialCode, mask }`,',
				'  в маске `#` — цифра. Названия стран — на языке кита через Intl.',
				'- Вставка полного номера — «+375 29 123-45-67», «8 916 123-45-67» или «7 916…» — сама выбирает страну и',
				'  убирает код страны или восьмёрку.',
				'- Поле — `type="tel"`, `autocomplete="tel-national"`; выбор страны — отдельный список «Код страны».',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BasePhoneInput>['parameters']
