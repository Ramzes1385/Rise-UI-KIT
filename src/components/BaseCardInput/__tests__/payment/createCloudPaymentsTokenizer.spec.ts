import '@testing-library/jest-dom/vitest'
import { defineComponent, h, ref } from 'vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import type { CardData } from '../../types/BaseCardInput.types'
import { BaseCardInput, createCloudPaymentsTokenizer } from '@components/BaseCardInput'
import type { CloudPaymentsCardFields, CloudPaymentsCheckoutConstructor } from '../../types/cloudPayments.types'

const CARD: CardData = {
	number: '4242424242424242',
	expiry: { month: 4, year: 2030 },
	code: '123',
	holder: 'IVAN IVANOV',
	brand: undefined,
}

function fakeCheckout(createPaymentCryptogram: (fields: CloudPaymentsCardFields) => Promise<string>) {
	const created: Array<{ publicId: string }> = []
	const Checkout = vi.fn(function Checkout(options: { publicId: string }) {
		created.push(options)
		return { createPaymentCryptogram }
	}) as unknown as CloudPaymentsCheckoutConstructor
	return { Checkout, created }
}

async function rejection(promise: Promise<unknown>): Promise<Error & { cause?: unknown }> {
	return promise.then(
		() => {
			throw new Error('ожидался отказ')
		},
		(error: Error) => error,
	)
}

describe('createCloudPaymentsTokenizer', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('передаёт поля карты в createPaymentCryptogram и возвращает криптограмму', async () => {
		const create = vi.fn(async () => 'CRYPTOGRAM')
		const { Checkout, created } = fakeCheckout(create)
		const tokenize = createCloudPaymentsTokenizer({ publicId: 'pk_test', Checkout })
		await expect(tokenize(CARD)).resolves.toBe('CRYPTOGRAM')
		expect(created).toEqual([{ publicId: 'pk_test' }])
		expect(create).toHaveBeenCalledWith({
			cardNumber: '4242424242424242',
			expDateMonth: '04',
			expDateYear: '30',
			cvv: '123',
			name: 'IVAN IVANOV',
		})
	})

	it('без имени владельца поля name нет', async () => {
		const create = vi.fn(async () => 'CRYPTOGRAM')
		const tokenize = createCloudPaymentsTokenizer({ publicId: 'pk_test', Checkout: fakeCheckout(create).Checkout })
		await tokenize({ ...CARD, holder: '', expiry: { month: 11, year: 2105 } })
		expect(create).toHaveBeenCalledWith({ cardNumber: CARD.number, expDateMonth: '11', expDateYear: '05', cvv: '123' })
	})

	it('Checkout создаётся лениво и один раз на адаптер', async () => {
		const { Checkout, created } = fakeCheckout(async () => 'CRYPTOGRAM')
		const tokenize = createCloudPaymentsTokenizer({ publicId: 'pk_test', Checkout })
		expect(created).toHaveLength(0)
		await tokenize(CARD)
		await tokenize(CARD)
		expect(created).toHaveLength(1)
	})

	it('по умолчанию берёт window.cp.Checkout', async () => {
		const { Checkout, created } = fakeCheckout(async () => 'FROM_WINDOW')
		vi.stubGlobal('cp', { Checkout })
		await expect(createCloudPaymentsTokenizer({ publicId: 'pk_window' })(CARD)).resolves.toBe('FROM_WINDOW')
		expect(created).toEqual([{ publicId: 'pk_window' }])
	})

	it('скрипт не подключён — отказ TOKENIZER_UNAVAILABLE; появился позже — следующий вызов работает', async () => {
		const tokenize = createCloudPaymentsTokenizer({ publicId: 'pk_test' })
		await expect(tokenize(CARD)).rejects.toThrow('Оплата картой недоступна: скрипт CloudPayments Checkout не подключён')
		vi.stubGlobal('cp', {})
		await expect(tokenize(CARD)).rejects.toThrow('Оплата картой недоступна: скрипт CloudPayments Checkout не подключён')
		vi.stubGlobal('cp', { Checkout: fakeCheckout(async () => 'LATE').Checkout })
		await expect(tokenize(CARD)).resolves.toBe('LATE')
	})

	it.each([
		['объект кодов', { CardNumber: 'CardNumber_Invalid', Cvv: 'Cvv_Empty', Extra: 1 }, ['CardNumber_Invalid', 'Cvv_Empty']],
		['строка', 'Timeout', ['Timeout']],
		['undefined', undefined, []],
		['число', 42, []],
	])('отказ Checkout (%s) — TOKENIZE_FAILED с кодами в cause', async (_name, reason, codes) => {
		const tokenize = createCloudPaymentsTokenizer({
			publicId: 'pk_test',
			Checkout: fakeCheckout(() => Promise.reject(reason)).Checkout,
		})
		const error = await rejection(tokenize(CARD))
		expect(error.message).toBe('Платёжная система не приняла данные карты')
		expect(error.cause).toEqual(codes)
	})

	it('Error из Checkout пробрасывается как есть', async () => {
		const original = new Error('network down')
		const tokenize = createCloudPaymentsTokenizer({
			publicId: 'pk_test',
			Checkout: fakeCheckout(() => Promise.reject(original)).Checkout,
		})
		expect(await rejection(tokenize(CARD))).toBe(original)
	})

	it('связка с BaseCardInput: ref.tokenize() после ввода карты с клавиатуры отдаёт криптограмму', async () => {
		const user = userEvent.setup()
		const create = vi.fn(async () => 'CRYPTOGRAM')
		const tokenize = createCloudPaymentsTokenizer({ publicId: 'pk_test', Checkout: fakeCheckout(create).Checkout })
		const cardRef = ref<InstanceType<typeof BaseCardInput> | null>(null)
		render(defineComponent(() => () => h(BaseCardInput, { ref: cardRef, tokenize, hasPreview: true })))
		await user.type(screen.getByLabelText('Номер карты'), '4242424242424242')
		await user.type(screen.getByLabelText('Срок действия'), '0430')
		await user.type(screen.getByLabelText(/^Код/), '123')
		await user.type(screen.getByLabelText('Имя владельца'), 'IVAN IVANOV')
		await expect(cardRef.value?.tokenize()).resolves.toBe('CRYPTOGRAM')
		expect(create).toHaveBeenCalledWith({
			cardNumber: '4242424242424242',
			expDateMonth: '04',
			expDateYear: '30',
			cvv: '123',
			name: 'IVAN IVANOV',
		})
	})
})
