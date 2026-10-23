import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCardInput from '../ui/BaseCardInput.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Поле банковской карты: номер, срок «ММ/ГГ», код и имя владельца. Марка определяется при вводе по таблице `cardUtils`',
				'(Visa, Mastercard, Мир, UnionPay, JCB, American Express и ещё 12) — значок в поле номера, цифры группируются по марке.',
				'',
				'- `v-model` — сводка без номера и кода: марка, последние 4 цифры, срок, имя и `isComplete`. Данные карты отдают только',
				'  `getCardData()` и адаптер `tokenize` — у полей нет `name`, ничего не пишется в хранилище и консоль.',
				'- Когда поле заполнено, фокус переходит к следующему; Backspace в начале поля возвращает к предыдущему.',
				'- Ошибки — после ухода из поля или после `validate()`; `brands` — принимаемые марки, остальные — «Карты … не принимаются».',
				'- Раскладка `stacked` или `inline`; группа — `fieldset` с `legend`, внутри BaseFormField её называет подпись обёртки.',
				'- Свои поля карты на странице магазина — PCI DSS SAQ A-EP; для SAQ A — форма эквайера в iframe.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseCardInput>['parameters']
