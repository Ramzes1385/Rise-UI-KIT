/** Bank card: BaseCardInput fields and errors */
export const enCard = {
	card: {
		GROUP: 'Bank card',
		NUMBER: 'Card number',
		EXPIRY: 'Expiry date',
		EXPIRY_PLACEHOLDER: 'MM/YY',
		CODE: 'Security code',
		HOLDER: 'Cardholder name',
		HOLDER_PLACEHOLDER: 'JOHN SMITH',
		NUMBER_INVALID: 'Check the card number',
		BRAND_NOT_ACCEPTED: '{brand} cards are not accepted',
		EXPIRY_INVALID: 'Enter the date as MM/YY',
		EXPIRY_PAST: 'The card has expired',
		CODE_INVALID: 'The code is {count} digits on the back of the card',
		HOLDER_INVALID: 'Name in Latin letters, as on the card',
		BRAND: 'Card brand: {brand}',
		BRAND_MIR: 'Mir',
		NO_TOKENIZER: 'BaseCardInput: tokenize is not set — nowhere to send the card data',
		INCOMPLETE: 'BaseCardInput: card data is incomplete',
	},
}
