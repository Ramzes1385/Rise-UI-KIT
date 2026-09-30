import type { PhoneCountry } from '../../types/BasePhoneInput.types'

export const PHONE_COUNTRIES: readonly PhoneCountry[] = [
	{ code: 'RU', dialCode: '7', mask: '(###) ###-##-##' },
	{ code: 'KZ', dialCode: '7', mask: '(###) ###-##-##' },
	{ code: 'BY', dialCode: '375', mask: '(##) ###-##-##' },
	{ code: 'UZ', dialCode: '998', mask: '(##) ###-##-##' },
	{ code: 'KG', dialCode: '996', mask: '(###) ###-###' },
	{ code: 'TJ', dialCode: '992', mask: '(##) ###-####' },
	{ code: 'AM', dialCode: '374', mask: '(##) ###-###' },
	{ code: 'AZ', dialCode: '994', mask: '(##) ###-##-##' },
	{ code: 'GE', dialCode: '995', mask: '(###) ##-##-##' },
	{ code: 'TR', dialCode: '90', mask: '(###) ###-##-##' },
	{ code: 'CN', dialCode: '86', mask: '(###) ####-####' },
	{ code: 'US', dialCode: '1', mask: '(###) ###-####' },
	{ code: 'GB', dialCode: '44', mask: '#### ######' },
]
