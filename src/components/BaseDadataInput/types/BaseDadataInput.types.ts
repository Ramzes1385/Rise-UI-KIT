import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/types/BaseInput.types'
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

/**
 * Пропсы компонента BaseDadataInput
 */
export interface BaseDadataInputProps extends BaseComponentProps<InputVariant, 'root' | 'field' | 'panel' | 'option'> {
	/** Значение (`v-model`): выбранная подсказка или набранный текст */
	modelValue?: string
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
	/** Текст ошибки под полем */
	error?: string
	/** Обязательное поле */
	isRequired?: boolean
	/** Отключает поле */
	isDisabled?: boolean
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
}
