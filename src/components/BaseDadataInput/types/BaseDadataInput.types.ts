import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/types/BaseInput.types'
import { AUTOCOMPLETE_PARTS } from '@components/BaseAutocomplete/types/BaseAutocomplete.types'
import type { DadataKind, DadataRequisites, DadataSource, DadataSuggestion } from '@utils/data/dadataUtils'

/** Варианты оформления — как у BaseInput и BaseAutocomplete */
export const DADATA_INPUT_VARIANTS = [
	'default',
	'ghost',
	'outline',
	'shadow',
	'soft',
	'filled',
	'underline',
] as const satisfies readonly InputVariant[]

/** Требуемая точность адреса: `any` — любая подсказка, `city` — до города или населённого пункта, `street` — до улицы (или дома без улицы), `house` — до дома, `flat` — до квартиры */
export const DADATA_PRECISIONS = ['any', 'city', 'street', 'house', 'flat'] as const

/** Точность адреса для `precision` */
export type DadataPrecision = (typeof DADATA_PRECISIONS)[number]

/**
 * Части поля DaData для пропа `ui` (`root` — корень). Своих БЭМ-элементов у обёртки нет: части принадлежат внутреннему
 * BaseAutocomplete и передаются ему — те же, что `AUTOCOMPLETE_PARTS`: список подсказок (dropdown, panel, panel-content,
 * options, option, option-label, match, option-description, empty, status) и части поля BaseInput (label, required, wrapper,
 * field, error-text).
 */
export const DADATA_INPUT_PARTS = [...AUTOCOMPLETE_PARTS] as const

export type BaseDadataInputPart = (typeof DADATA_INPUT_PARTS)[number]

/**
 * Пропсы компонента BaseDadataInput
 */
export interface BaseDadataInputProps extends BaseComponentProps<InputVariant, 'root' | 'field' | 'panel' | 'option'> {
	/** Значение (`v-model`): выбранная подсказка или набранный текст */
	modelValue?: string
	/**
	 * Выбранная подсказка целиком (`v-model:suggestion`): `value`, `unrestrictedValue` и все данные сервиса в `data`
	 * (`fias_id`, `geo_lat`, `house`, `flat`, ИНН, БИК…). Правка текста после выбора сбрасывает её в `null`;
	 * текст, совпавший с подсказкой при уходе из поля, её выбирает
	 */
	suggestion?: DadataSuggestion | null
	/**
	 * Только из подсказок: свой текст не подтверждает значение — при уходе из поля без выбора текст остаётся,
	 * `suggestion` — `null`, под полем ошибка «Выберите вариант из списка», событие `validate(false)`
	 */
	isStrict?: boolean
	/**
	 * Требуемая точность адреса (только `kind="address"`). Подсказка ниже уровня не подтверждается: в поле — её текст
	 * с пробелом и новый поиск, при уходе из поля — ошибка «Укажите дом» и т. п. Уровень — по полям `data`:
	 * `city`/`settlement`, `street` (или `house`), `house`, `flat`
	 */
	precision?: DadataPrecision
	/** Вид подсказок: `address` — адрес, `party` — организация или ИП, `bank` — банк, `fio` — ФИО, `email` — почта */
	kind?: DadataKind
	/**
	 * Ключ API DaData. Задаётся пропом или для всех полей настройкой плагина `defaults.BaseDadataInput.token`.
	 * Ключ в браузере виден всем — для открытого сайта лучше свой прокси (`baseUrl`) без ключа
	 */
	token?: string
	/** Адрес API подсказок без вида (`…/suggest`): свой прокси; по умолчанию — сервер DaData */
	baseUrl?: string
	/** Сколько подсказок запрашивать; по умолчанию 7 */
	count?: number
	/** Прочие поля запроса DaData: `locations`, `status`, `type`, `parts`, `from_bound` и др. */
	params?: Record<string, unknown>
	/** Свой источник подсказок вместо запросов к DaData: свой сервер, кэш, подменные данные в тестах */
	source?: DadataSource
	/** С какой длины запроса искать; по умолчанию 3 */
	minChars?: number
	/** Пауза после ввода перед запросом, мс; по умолчанию 300 */
	debounce?: number
	/** Подпись поля; без неё имя поля — название вида подсказок («Организация или ИП») */
	label?: string
	/** Подсказка в пустом поле */
	placeholder?: string
	/**
	 * Текст ошибки под полем; важнее встроенных проверок. Встроенные (после ухода из поля): обязательное поле,
	 * `isStrict`, `precision`, формат почты у `email`, контрольное число ИНН/ОГРН и формат БИК у запроса из цифр
	 */
	error?: string
	/** Обязательное поле: пустое после ухода из поля — ошибка и `validate(false)` */
	isRequired?: boolean
	/** Отключает поле */
	isDisabled?: boolean
	/**
	 * Классы частей (`root`, `option`, `empty`, `panel`, `wrapper`, `field`… — см. `DADATA_INPUT_PARTS`) — добавляются к классам кита.
	 * Передаются частям внутреннего BaseAutocomplete (его проп `ui`). Глобально — `defaults.BaseDadataInput.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseDadataInput :ui="{ option: 'py-2', wrapper: 'shadow-sm' }" kind="party" />
	 */
	ui?: UiProp<BaseDadataInputPart>
}

/**
 * События компонента BaseDadataInput
 */
export interface BaseDadataInputEmits {
	/** Новое значение: выбор подсказки или свой текст после ухода из поля */
	(event: 'update:modelValue', value: string): void
	/**
	 * Выбрана подсказка: все данные сервиса и реквизиты из неё (`inn`, `kpp`, `ogrn` у организации, `bik`,
	 * `correspondentAccount` у банка) — их можно передать в BaseRequisiteInput
	 */
	(event: 'select', suggestion: DadataSuggestion, requisites: DadataRequisites): void
	/** Выбранная подсказка (`v-model:suggestion`): объект при выборе, `null` — правка текста, очистка, неполный адрес */
	(event: 'update:suggestion', suggestion: DadataSuggestion | null): void
	/**
	 * Итог встроенных проверок при уходе из поля и при выборе подсказки: `true` — значение подходит,
	 * `false` — ошибка, `null` — поле пустое и необязательное
	 */
	(event: 'validate', isValid: boolean | null): void
}
