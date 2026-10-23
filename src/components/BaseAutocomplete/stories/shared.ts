import type { AutocompleteOption } from '../types/BaseAutocomplete.types'

export const CITIES: AutocompleteOption[] = [
	{ value: 'msk', label: 'Москва' },
	{ value: 'spb', label: 'Санкт-Петербург' },
	{ value: 'kzn', label: 'Казань' },
	{ value: 'nsk', label: 'Новосибирск' },
	{ value: 'ekb', label: 'Екатеринбург' },
	{ value: 'nnv', label: 'Нижний Новгород' },
	{ value: 'vlg', label: 'Волгоград' },
	{ value: 'vld', label: 'Владивосток', isDisabled: true, description: 'Доставка временно недоступна' },
]
