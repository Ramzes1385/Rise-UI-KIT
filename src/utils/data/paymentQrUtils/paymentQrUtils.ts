/** Утилиты: платёжная строка ГОСТ Р 56042-2014 для QR-кода оплаты по реквизитам */

import { formatMessage } from '@/locales/state'
import { UI_WARNINGS } from '@/locales/messages'
import type { GostPayment } from './types/paymentQrUtils.types'
import { isValidAccount, isValidBik, isValidCorrespondentAccount, isValidInn, isValidKpp } from '@utils/data/requisiteUtils'

/** Заголовок: формат ST, версия 0001, кодировка 2 — UTF-8 (так кодирует BaseQrCode) */
const HEADER = 'ST00012'

/** Имя реквизита: латинские буквы и цифры, с буквы */
const KEY_RE = /^[A-Za-z][A-Za-z\d]*$/

/** Обязательные реквизиты стандарта */
const REQUIRED_KEYS = ['Name', 'PersonalAcc', 'BankName', 'BIC', 'CorrespAcc']

/** Реквизиты, которые задают поля GostPayment, — в extra их не повторяют */
const OWN_KEYS = ['Name', 'PersonalAcc', 'BankName', 'BIC', 'CorrespAcc', 'PayeeINN', 'KPP', 'Purpose', 'Sum']

function fail(message: string, params: Record<string, string>): never {
	throw new Error(`[rise-ui-kit] ${formatMessage(message, params)}`)
}

function checkValue([key, value]: readonly [string, string | undefined]): void {
	if (value === undefined && !REQUIRED_KEYS.includes(key)) return
	if (!value?.trim()) fail(UI_WARNINGS.PAYMENT_QR_REQUIRED, { key })
	if (value.includes('|')) fail(UI_WARNINGS.PAYMENT_QR_SEPARATOR, { key })
}

function check(key: string, value: string, isValid: boolean): void {
	if (!isValid) fail(UI_WARNINGS.PAYMENT_QR_INVALID, { key, value })
}

function checkRequisites(payment: GostPayment): void {
	check('BIC', payment.bic, isValidBik(payment.bic))
	check('PersonalAcc', payment.personalAcc, isValidAccount(payment.personalAcc, payment.bic))
	check('CorrespAcc', payment.correspAcc, isValidCorrespondentAccount(payment.correspAcc, payment.bic))
	if (payment.payeeInn !== undefined) check('PayeeINN', payment.payeeInn, isValidInn(payment.payeeInn))
	if (payment.kpp !== undefined) check('KPP', payment.kpp, isValidKpp(payment.kpp))
	const sum = payment.sumKopecks
	if (sum !== undefined) check('Sum', String(sum), Number.isSafeInteger(sum) && sum > 0)
}

function extraFields(extra: GostPayment['extra']): [string, string][] {
	return Object.entries(extra ?? {}).map(([key, value]) => {
		if (!KEY_RE.test(key) || OWN_KEYS.includes(key)) fail(UI_WARNINGS.PAYMENT_QR_KEY, { key })
		return [key, value]
	})
}

/**
 * Платёжная строка ГОСТ Р 56042-2014 в UTF-8: `ST00012|Name=…|PersonalAcc=…|BankName=…|BIC=…|CorrespAcc=…`
 * и необязательные `PayeeINN`, `KPP`, `Purpose`, `Sum` (в копейках), затем `extra`. Передайте её в `value` BaseQrCode.
 * Неверный БИК, ключ счёта, ИНН, КПП, сумма, пустое значение или `|` в значении — исключение: это ошибка в данных
 * приложения, а не ввод пользователя, и молча чинить её нельзя.
 */
export function gostPaymentText(payment: GostPayment): string {
	const fields: [string, string | undefined][] = [
		['Name', payment.name],
		['PersonalAcc', payment.personalAcc],
		['BankName', payment.bankName],
		['BIC', payment.bic],
		['CorrespAcc', payment.correspAcc],
		['PayeeINN', payment.payeeInn],
		['KPP', payment.kpp],
		['Purpose', payment.purpose],
		['Sum', payment.sumKopecks === undefined ? undefined : String(payment.sumKopecks)],
		...extraFields(payment.extra),
	]
	fields.forEach(checkValue)
	checkRequisites(payment)
	const pairs = fields.filter((field): field is [string, string] => field[1] !== undefined)
	return [HEADER, ...pairs.map(([key, value]) => `${key}=${value}`)].join('|')
}
