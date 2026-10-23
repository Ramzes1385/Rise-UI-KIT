/** Банковская карта: поля BaseCardInput и ошибки */
export const ruCard = {
	GROUP: 'Банковская карта',
	NUMBER: 'Номер карты',
	EXPIRY: 'Срок действия',
	EXPIRY_PLACEHOLDER: 'ММ/ГГ',
	CODE: 'Код',
	HOLDER: 'Имя владельца',
	HOLDER_PLACEHOLDER: 'IVAN IVANOV',
	/** Ошибки полей; `{brand}` — название марки */
	NUMBER_INVALID: 'Проверьте номер карты',
	BRAND_NOT_ACCEPTED: 'Карты {brand} не принимаются',
	EXPIRY_INVALID: 'Укажите срок в виде ММ/ГГ',
	EXPIRY_PAST: 'Срок действия карты истёк',
	CODE_INVALID: 'Код — {count} цифры с оборота карты',
	HOLDER_INVALID: 'Имя латиницей, как на карте',
	/** Марка в поле номера для чтения с экрана */
	BRAND: 'Марка карты: {brand}',
	/** Переводы названий марок; остальные — латиницей из таблицы */
	BRAND_MIR: 'Мир',
	/** Ошибка `tokenize()` без адаптера */
	NO_TOKENIZER: 'BaseCardInput: не задан tokenize — данные карты некуда передать',
	INCOMPLETE: 'BaseCardInput: данные карты заполнены не полностью',
	/** Ошибки адаптера createCloudPaymentsTokenizer */
	TOKENIZER_UNAVAILABLE: 'Оплата картой недоступна: скрипт CloudPayments Checkout не подключён',
	TOKENIZE_FAILED: 'Платёжная система не приняла данные карты',
	/** BaseBankCard — сохранённая карта; `{brand}` — марка, `{last4}` — последние цифры, `{date}` — срок ММ/ГГ */
	SAVED_CARD: 'Карта',
	SAVED_ENDING: '{brand}, номер заканчивается на {last4}',
	SAVED_EXPIRES: 'срок до {date}',
	SAVED_EXPIRED: 'срок истёк {date}',
	EXPIRED: 'Истекла',
}
