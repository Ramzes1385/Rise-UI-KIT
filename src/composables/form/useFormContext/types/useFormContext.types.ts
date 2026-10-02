import type { ComputedRef, MaybeRefOrGetter } from 'vue'

/** Контекст BaseForm для вложенных контролов и полей */
export interface FormContext {
	/** Форма отключена или отправляется: кастомные контролы блокируются так же, как нативные в `fieldset[disabled]` */
	isDisabled: ComputedRef<boolean>
	/** Ошибки проверки по схеме: имя поля (путь через точку) → текст */
	errors: ComputedRef<Readonly<Record<string, string>>>
}

/** Контекст BaseFormField для контрола внутри обёртки */
export interface FormFieldContext {
	/** id подписи обёртки: контролы без `<label for>` (combobox) называются через `aria-labelledby` */
	labelId: string
	/** Подпись есть: только тогда `labelId` указывает на элемент */
	hasLabel: ComputedRef<boolean>
	/** Описание или ошибка обёртки — для `aria-describedby` контрола */
	describedBy: ComputedRef<string | undefined>
	/** У обёртки есть ошибка: контрол помечается `aria-invalid` и цветом ошибки */
	hasError: ComputedRef<boolean>
	/** Обёртка обязательна: контрол получает `aria-required` */
	isRequired: ComputedRef<boolean>
	/**
	 * Подключить контрол: первый контрол сообщает id своего элемента. Нативное поле (`isLabelable`) подпись называет
	 * через `for`, остальные (combobox на `div`) — через `aria-labelledby` сами.
	 * Возвращает функцию отключения или `undefined`, если у обёртки уже есть контрол
	 */
	register: (getId: () => string, isLabelable: boolean) => (() => void) | undefined
}

export interface UseFieldControlOptions {
	/** Свой id элемента (`inputAttrs.id`); без него — сгенерированный */
	id?: () => string | undefined
	/** Собственные описания контрола (ошибка, счётчик) — идут в `aria-describedby` первыми */
	describedBy?: () => string | undefined
	/** Своя ошибка контрола */
	hasError?: () => boolean
	/** Элемент — нативное поле, которое подпись называет через `for` (по умолчанию `true`) */
	isLabelable?: boolean
	/**
	 * У контрола своя подпись (флажок, переключатель или группа радиокнопок с текстом): он не занимает подпись обёртки —
	 * обёртка остаётся группой со своими подписью, описанием и ошибкой, а контрол берёт из неё только обязательность
	 * и цвет ошибки (`hasError`), без `aria-invalid` и `aria-describedby` обёртки. Реактивно: подпись, появившаяся позже,
	 * освобождает обёртку, пропавшая — подключает контрол
	 */
	hasOwnLabel?: MaybeRefOrGetter<boolean | undefined>
	/** Свой признак обязательности */
	isRequired?: () => boolean
}

export interface FieldControlAria {
	'aria-invalid': 'true' | undefined
	'aria-required': 'true' | undefined
	'aria-describedby': string | undefined
}

export interface UseFieldControlReturn {
	/** id элемента контрола */
	id: ComputedRef<string>
	/** Контрол подключён к BaseFormField (подпись обёртки называет его); геттер — читай из возвращённого объекта */
	readonly isInField: boolean
	/** id подписи обёртки, если контрол в ней и подпись есть — для `aria-labelledby` */
	fieldLabelId: ComputedRef<string | undefined>
	/** Ошибка своя или обёртки — для цвета ошибки */
	hasError: ComputedRef<boolean>
	/** `aria-invalid`, `aria-required`, `aria-describedby` */
	aria: ComputedRef<FieldControlAria>
}

/**
 * Атрибуты нативного поля (`inputAttrs` у BaseInput и BaseTextarea): `name`, `autocomplete`, `inputmode`, `aria-*`,
 * `data-*`. `id` заменяет сгенерированный id поля, `aria-describedby` добавляется к описаниям кита.
 */
export type FieldInputAttrs = Record<string, string | number | boolean | undefined>
