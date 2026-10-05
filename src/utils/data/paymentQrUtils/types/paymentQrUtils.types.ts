/** Реквизиты платежа для строки ГОСТ Р 56042-2014: обязательные поля, ИНН и КПП получателя, назначение и сумма */
export interface GostPayment {
	/** Наименование получателя — Name */
	name: string
	/** Расчётный счёт получателя, 20 цифр — PersonalAcc; проверяется ключ по БИК */
	personalAcc: string
	/** Наименование банка получателя — BankName */
	bankName: string
	/** БИК банка получателя, 9 цифр — BIC */
	bic: string
	/** Корреспондентский счёт банка, 20 цифр — CorrespAcc; проверяется ключ по БИК */
	correspAcc: string
	/** ИНН получателя, 10 или 12 цифр — PayeeINN; проверяется контрольное число */
	payeeInn?: string
	/** КПП получателя, 9 знаков — KPP */
	kpp?: string
	/** Назначение платежа — Purpose */
	purpose?: string
	/** Сумма в копейках, целое больше нуля — Sum (12 500 ₽ — 1250000) */
	sumKopecks?: number
	/** Прочие реквизиты стандарта по их именам (PayerAddress, DocNo, …) — в конце строки, в порядке объекта */
	extra?: Readonly<Record<string, string>>
}
