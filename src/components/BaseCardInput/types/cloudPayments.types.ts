/** Поля карты для `createPaymentCryptogram` скрипта Checkout CloudPayments (developers.cloudpayments.ru, «Скрипт Checkout») */
export interface CloudPaymentsCardFields {
	/** Номер карты — только цифры */
	cardNumber: string
	/** Месяц срока, две цифры */
	expDateMonth: string
	/** Год срока, две последние цифры */
	expDateYear: string
	/** Код безопасности */
	cvv: string
	/** Имя владельца, если поле есть */
	name?: string
}

/** Объект Checkout скрипта CloudPayments — только используемый метод */
export interface CloudPaymentsCheckout {
	/** Криптограмма карты для оплаты на сервере; при ошибке Promise отклоняется объектом кодов (`CardNumber_Invalid`…) */
	createPaymentCryptogram: (fields: CloudPaymentsCardFields) => Promise<string>
}

/** Конструктор `cp.Checkout` */
export type CloudPaymentsCheckoutConstructor = new (options: { publicId: string }) => CloudPaymentsCheckout

/** Окно со скриптом `https://checkout.cloudpayments.ru/checkout.js` */
export interface CloudPaymentsWindow {
	cp?: { Checkout?: CloudPaymentsCheckoutConstructor }
}

/** Настройки адаптера `createCloudPaymentsTokenizer` */
export interface CloudPaymentsTokenizerOptions {
	/** Public ID сайта из личного кабинета CloudPayments */
	publicId: string
	/** Свой конструктор Checkout (тесты, эмуляция). По умолчанию — `window.cp.Checkout` скрипта, который подключает приложение */
	Checkout?: CloudPaymentsCheckoutConstructor
}
