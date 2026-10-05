import { gostPaymentText } from '../paymentQrUtils'
import type { GostPayment } from '../types/paymentQrUtils.types'

const PAYMENT: GostPayment = {
	name: 'ООО «Ромашка»',
	personalAcc: '40702810938000012345',
	bankName: 'ПАО СБЕРБАНК',
	bic: '044525225',
	correspAcc: '30101810400000000225',
}

describe('gostPaymentText', () => {
	it('обязательные реквизиты — точная строка с заголовком ST00012 (UTF-8)', () => {
		expect(gostPaymentText(PAYMENT)).toBe(
			'ST00012|Name=ООО «Ромашка»|PersonalAcc=40702810938000012345|BankName=ПАО СБЕРБАНК|BIC=044525225|CorrespAcc=30101810400000000225',
		)
	})

	it('ИНН, КПП, назначение, сумма в копейках и extra — в этом порядке', () => {
		const text = gostPaymentText({
			...PAYMENT,
			payeeInn: '7707083893',
			kpp: '773601001',
			purpose: 'Оплата по счёту № 42',
			sumKopecks: 1250000,
			extra: { DocNo: '42', PayerAddress: 'Волгоград' },
		})
		expect(text.split('|').slice(6)).toEqual([
			'PayeeINN=7707083893',
			'KPP=773601001',
			'Purpose=Оплата по счёту № 42',
			'Sum=1250000',
			'DocNo=42',
			'PayerAddress=Волгоград',
		])
	})

	it.each([
		['пустое наименование', { name: '  ' }, /реквизит Name не задан/],
		['нет счёта', { personalAcc: undefined as unknown as string }, /реквизит PersonalAcc не задан/],
		['неверный БИК', { bic: '123456789' }, /BIC/],
		['ключ счёта не сходится с БИК', { personalAcc: '40702810138000012345' }, /PersonalAcc/],
		['неверный корр. счёт', { correspAcc: '30101810400000000226' }, /CorrespAcc/],
		['неверный ИНН', { payeeInn: '7707083894' }, /PayeeINN/],
		['неверный КПП', { kpp: '77360100' }, /KPP/],
		['дробная сумма', { sumKopecks: 10.5 }, /Sum/],
		['нулевая сумма', { sumKopecks: 0 }, /Sum/],
		['| в назначении', { purpose: 'Оплата | услуги' }, /символ «\|» в реквизите Purpose/],
		['пустое необязательное', { purpose: '' }, /реквизит Purpose не задан/],
		['extra со своим именем', { extra: { Sum: '1' } }, /имя реквизита «Sum»/],
		['extra с неверным именем', { extra: { 'Doc No': '1' } }, /имя реквизита «Doc No»/],
		['| в extra', { extra: { DocNo: '4|2' } }, /DocNo/],
	] as const)('%s — исключение', (_, change, message) => {
		expect(() => gostPaymentText({ ...PAYMENT, ...change })).toThrow(message)
	})

	it('исключение с префиксом кита', () => {
		expect(() => gostPaymentText({ ...PAYMENT, bic: '' })).toThrow(/^\[rise-ui-kit\] /)
	})
})
