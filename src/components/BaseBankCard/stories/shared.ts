export const SAVED_CARDS = {
	visa: { brand: 'visa', last4: '4242', expiry: '12/34', holder: 'IVAN IVANOV', label: 'Основная' },
	mastercard: { brand: 'mastercard', last4: '4444', expiry: '08/35', holder: 'IVAN IVANOV', label: 'Рабочая' },
	mir: { brand: 'mir', last4: '9019', expiry: '03/36', holder: 'IVAN IVANOV', label: 'Для подписок' },
	amex: { brand: 'amex', last4: '0005', expiry: '01/20', holder: 'IVAN IVANOV', label: 'Старая' },
}

export const SAVED_CARD_OPTIONS = [
	{ value: 'visa', label: 'Visa •••• 4242' },
	{ value: 'mastercard', label: 'Mastercard •••• 4444' },
	{ value: 'mir', label: 'Мир •••• 9019' },
	{ value: 'amex', label: 'American Express •••• 0005', isDisabled: true },
]
