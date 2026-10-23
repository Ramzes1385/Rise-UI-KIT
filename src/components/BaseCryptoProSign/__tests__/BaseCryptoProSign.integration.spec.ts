import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import type { CryptoProFailure } from '@composables/crypto/useCryptoPro'
import { digestOf, encodeSignature } from '../model/emulation/emulatedSignature'
import type { CryptoProSignResult, CryptoProVerifyResult } from '../types/BaseCryptoProSign.types'
import {
	NOW,
	THUMBPRINTS,
	callsOf,
	freezeDate,
	lastEmitted,
	signButton,
	renderReady,
	textToBase64,
	renderExposed,
	restoreEmulation,
} from './cryptoProSignTestUtils'

beforeEach(() => freezeDate())

afterEach(() => {
	restoreEmulation()
	vi.useRealTimers()
	vi.restoreAllMocks()
})

const MB = 1024 * 1024

function bigFile(size: number, name = 'scan.pdf'): File {
	const bytes = new Uint8Array(size)
	for (let index = 0; index < size; index++) bytes[index] = index % 251
	return new File([bytes], name)
}

interface SignatureSpec {
	data: string
	detached?: boolean
	level?: 'BES' | 'T' | 'XLT1'
	thumbprint?: string
}

function emulatedSignature({ data, detached = false, level = 'BES', thumbprint = THUMBPRINTS.ivanov }: SignatureSpec): string {
	const content = textToBase64(data)
	return encodeSignature({
		level,
		detached,
		thumbprint,
		digest: digestOf(content),
		signingTime: NOW.toISOString(),
		timeStamp: level === 'BES' ? '' : NOW.toISOString(),
		content: detached ? '' : content,
	})
}

async function upload(label: string, file: File): Promise<void> {
	const input = screen.getByLabelText(label, { selector: 'input' }) as HTMLInputElement
	Object.defineProperty(input, 'files', { value: [file], configurable: true })
	await fireEvent.change(input)
}

async function removeUploaded(name: string): Promise<void> {
	await userEvent.click(await screen.findByRole('button', { name: new RegExp(`${name}$`) }))
}

function liveRegion(): HTMLElement {
	const region = document.querySelector<HTMLElement>('.base-crypto-pro-sign__live')
	if (!region) throw new Error('нет .base-crypto-pro-sign__live')
	return region
}

function verifyButton(): HTMLElement {
	return screen.getByRole('button', { name: 'Проверить подпись' })
}

async function verified(emitted: () => Record<string, unknown[][]>): Promise<CryptoProVerifyResult> {
	await waitFor(() => expect(emitted().verified).toBeTruthy())
	return lastEmitted<CryptoProVerifyResult>(emitted(), 'verified')
}

async function signed(emitted: () => Record<string, unknown[][]>): Promise<CryptoProSignResult> {
	await waitFor(() => expect(emitted().signed).toBeTruthy())
	return lastEmitted<CryptoProSignResult>(emitted(), 'signed')
}

async function clickWhenEnabled(button: () => HTMLElement): Promise<void> {
	await waitFor(() => expect(button()).toBeEnabled())
	await userEvent.click(button())
}

async function signFirst(props: Record<string, unknown>, keys512?: string[]): Promise<string> {
	const view = await renderReady({ props }, { keys512 })
	await clickWhenEnabled(signButton)
	const { signature } = await signed(view.emitted)
	view.unmount()
	restoreEmulation()
	return signature
}

describe('BaseCryptoProSign integration', () => {
	describe('подпись файла', () => {
		it('без data — поле «Документ»: выбрать файл, подписать, убрать файл', async () => {
			const { emitted } = await renderReady()
			await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('Иванов Иван Иванович'))
			expect(signButton()).toBeDisabled()
			await upload('Документ', new File(['%PDF-1.7'], 'act.pdf'))
			await clickWhenEnabled(signButton)
			const result = await signed(emitted)
			expect(result).toMatchObject({ fileName: 'act.pdf', isHash: false, detached: false })
			expect(
				screen.getByText('Подпись создана: act.pdf.sig', { selector: '.base-crypto-pro-sign-result__title' }),
			).toBeInTheDocument()
			await removeUploaded('act.pdf')
			await waitFor(() => expect(signButton()).toBeDisabled())
		})

		it('файл больше hashThreshold — только отсоединённая подпись хэша ГОСТ 256 частями, с ходом хэша', async () => {
			const file = bigFile(2 * MB)
			const { emitted, emulation } = await renderReady({ props: { data: file, hashThreshold: MB } }, { delay: 40 })
			expect(screen.getByText(/Документ больше 1(,0)? МБ: подписывается его хэш, подпись только отсоединённая/)).toBeInTheDocument()
			expect(screen.getByRole('radio', { name: 'Присоединённая' })).toBeDisabled()
			expect(screen.getByRole('radio', { name: 'Отсоединённая' })).toBeChecked()
			await clickWhenEnabled(signButton)
			const progress = await screen.findByRole('progressbar', { name: 'Считаем хэш документа' })
			expect(progress).toHaveAttribute('aria-valuenow', '100')
			const result = await signed(emitted)
			expect(result).toMatchObject({ isHash: true, detached: true, fileName: 'scan.pdf' })
			expect(atob(result.signature)).toMatch(/detached=true;.*digest=256:/)
			expect(callsOf(emulation, 'HashedData.propset_Algorithm')[0]?.args).toEqual([101])
			expect(callsOf(emulation, 'HashedData.propset_DataEncoding')[0]?.args).toEqual([1])
			expect(callsOf(emulation, 'HashedData.Hash').map(call => call.args[0])).toEqual([1048576, 1048576, 699052])
			expect(callsOf(emulation, 'CadesSignedData.SignHash')[0]?.args).toEqual(['HashedData', 'CPSigner', 1])
			expect(callsOf(emulation, 'CadesSignedData.SignCades')).toHaveLength(0)
			expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
		})

		it('ключ ГОСТ 512 — хэш по алгоритму 102', async () => {
			const { emitted, emulation } = await renderReady(
				{ props: { data: bigFile(4096), hashThreshold: 1024 } },
				{ keys512: [THUMBPRINTS.ivanov.toLowerCase()] },
			)
			await clickWhenEnabled(signButton)
			expect(atob((await signed(emitted)).signature)).toMatch(/digest=512:/)
			expect(callsOf(emulation, 'HashedData.propset_Algorithm')[0]?.args).toEqual([102])
		})

		it('текст больше hashThreshold подписывается целиком', async () => {
			const { emitted, emulation } = await renderReady({ props: { data: 'x'.repeat(100), hashThreshold: 10 } })
			expect(screen.getByRole('radio', { name: 'Присоединённая' })).toBeEnabled()
			await clickWhenEnabled(signButton)
			expect((await signed(emitted)).isHash).toBe(false)
			expect(callsOf(emulation, 'HashedData.Hash')).toHaveLength(0)
		})

		it('уровень t по хэшу — штамп времени в подписи', async () => {
			const props = { data: bigFile(2048), hashThreshold: 1024, level: 't', tsaAddress: 'http://tsp.example.ru' }
			const { emitted, emulation } = await renderReady({ props })
			await clickWhenEnabled(signButton)
			expect(atob((await signed(emitted)).signature)).toMatch(/^RISE-EMULATED-CADES-T;.*timeStamp=2026-03-10/)
			expect(callsOf(emulation, 'CadesSignedData.SignHash')[0]?.args).toEqual(['HashedData', 'CPSigner', 5])
		})
	})

	describe('проверка подписи (mode="verify")', () => {
		it('область проверки, без выбора сертификата и скачивания; без подписи кнопка недоступна', async () => {
			await renderReady({ props: { mode: 'verify' } })
			expect(screen.getByRole('region', { name: 'Проверка электронной подписи' })).toBeInTheDocument()
			expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
			expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
			const signatureInput = screen.getByLabelText('Файл подписи', { selector: 'input' })
			expect(signatureInput).toHaveAttribute('accept', '.sig,.sgn,.p7s,.p7m,.bin,.txt')
			expect(screen.getByLabelText('Подписанный документ — для отсоединённой подписи', { selector: 'input' })).toBeInTheDocument()
			expect(verifyButton()).toBeDisabled()
		})

		it('присоединённая подпись верна — подписант, время подписи, срок сертификата', async () => {
			const signature = emulatedSignature({ data: 'Привет' })
			const { emitted, emulation } = await renderReady({ props: { mode: 'verify', signature } })
			expect(screen.getByText('Подпись для проверки получена')).toBeInTheDocument()
			await clickWhenEnabled(verifyButton)
			const result = await verified(emitted)
			expect(result).toMatchObject({ isValid: true, isDetached: false, isHash: false, error: null })
			expect(result.signers[0]).toMatchObject({
				name: 'Иванов Иван Иванович',
				organization: 'ООО "Ромашка"',
				inn: '771234567890',
				thumbprint: THUMBPRINTS.ivanov,
				isSignatureValid: true,
				isCertificateValid: true,
				timeStampTime: null,
			})
			expect(result.signers[0]?.signingTime?.toISOString()).toBe(NOW.toISOString())
			expect(callsOf(emulation, 'CadesSignedData.VerifyCades')[0]?.args).toEqual([signature.length, 1, false])
			expect(callsOf(emulation, 'CadesSignedData.propset_Content')).toHaveLength(0)
			const signer = screen.getByRole('listitem')
			expect(signer).toHaveTextContent('Иванов Иван Иванович')
			expect(signer).toHaveTextContent('ООО "Ромашка" · ИНН 771234567890')
			expect(signer).toHaveTextContent(/Подписано: 10\.03\.2026, \d\d:\d\d/)
			expect(signer).toHaveTextContent('Сертификат действует до 11.09.2026')
			expect(signer).not.toHaveTextContent('Штамп времени')
			expect(screen.getByText('Подпись верна', { selector: '.base-crypto-pro-sign-result__title' })).toBeInTheDocument()
			expect(liveRegion()).toHaveTextContent('Подпись верна')
			expect(screen.queryByRole('button', { name: 'Скачать подпись' })).not.toBeInTheDocument()
		})

		it('отсоединённая подпись с данными — содержимое передаётся, VerifyCades с detached', async () => {
			const signature = emulatedSignature({ data: 'Привет', detached: true, level: 'T' })
			const { emitted, emulation } = await renderReady({ props: { mode: 'verify', signature, data: 'Привет' } })
			await clickWhenEnabled(verifyButton)
			const result = await verified(emitted)
			expect(result).toMatchObject({ isValid: true, isDetached: true })
			expect(callsOf(emulation, 'CadesSignedData.propset_Content')[0]?.args).toEqual([textToBase64('Привет')])
			expect(callsOf(emulation, 'CadesSignedData.VerifyCades')[0]?.args).toEqual([signature.length, 1, true])
			expect(screen.getByRole('listitem')).toHaveTextContent(/Штамп времени: 10\.03\.2026, \d\d:\d\d/)
		})

		it.each([
			{ name: 'изменённые данные', spec: { data: 'Привет', detached: true }, data: 'Пока', code: '0x80091007' },
			{ name: 'отсоединённая без данных', spec: { data: 'Привет', detached: true }, data: undefined, code: '0x8009100E' },
			{ name: 'присоединённая с данными', spec: { data: 'Привет' }, data: 'Привет', code: '0x8009310B' },
		])('$name — подпись неверна, verified с isValid=false, без error', async ({ spec, data, code }) => {
			const signature = emulatedSignature(spec)
			const { emitted } = await renderReady({ props: { mode: 'verify', signature, data } })
			await clickWhenEnabled(verifyButton)
			const result = await verified(emitted)
			expect(result.isValid).toBe(false)
			expect(result.signers).toEqual([])
			expect(result.error?.detail).toContain(code)
			expect(emitted().error).toBeUndefined()
			expect(screen.getByText('Подпись не прошла проверку', { selector: '.base-crypto-pro-sign-result__title' })).toBeInTheDocument()
			expect(screen.getByText(new RegExp(code), { selector: '.base-crypto-pro-sign-result__detail' })).toBeInTheDocument()
			expect(liveRegion()).toHaveTextContent('Подпись не прошла проверку')
		})

		it('не подпись эмуляции — неверный формат', async () => {
			const { emitted } = await renderReady({ props: { mode: 'verify', signature: btoa('garbage') } })
			await clickWhenEnabled(verifyButton)
			expect((await verified(emitted)).error?.detail).toContain('0x8009310B')
		})

		it('подписант с просроченным сертификатом — «Сертификат недействителен»', async () => {
			const signature = emulatedSignature({ data: 'x', thumbprint: THUMBPRINTS.sidorova })
			const { emitted } = await renderReady({ props: { mode: 'verify', signature } })
			await clickWhenEnabled(verifyButton)
			expect((await verified(emitted)).signers[0]?.isCertificateValid).toBe(false)
			expect(screen.getByRole('listitem')).toHaveTextContent('Сертификат недействителен')
			expect(screen.getByRole('listitem')).toHaveTextContent('Сидорова Анна Сергеевна')
		})

		it.each([
			['DER', (signature: string) => Uint8Array.from(atob(signature), char => char.charCodeAt(0))],
			['Base64 с переносами', (signature: string) => `${signature.slice(0, 20)}\n${signature.slice(20)}\n`],
			['PEM', (signature: string) => `-----BEGIN PKCS7-----\n${signature}\n-----END PKCS7-----\n`],
		] as const)('файл подписи %s — подпись читается и проверяется', async (_, toContent) => {
			const signature = emulatedSignature({ data: 'Привет', detached: true })
			const { emitted, emulation } = await renderReady({ props: { mode: 'verify' } })
			await upload('Файл подписи', new File([toContent(signature)], 'act.sig'))
			await upload('Подписанный документ — для отсоединённой подписи', new File(['Привет'], 'act.txt'))
			await clickWhenEnabled(verifyButton)
			expect((await verified(emitted)).isValid).toBe(true)
			expect(callsOf(emulation, 'CadesSignedData.VerifyCades')[0]?.args).toEqual([signature.length, 1, true])
		})

		it('убрать файл подписи — кнопка снова недоступна; убрать документ — проверка без данных', async () => {
			const signature = emulatedSignature({ data: 'Привет' })
			const { emitted, emulation } = await renderReady({ props: { mode: 'verify' } })
			await upload('Подписанный документ — для отсоединённой подписи', new File(['Привет'], 'act.txt'))
			await removeUploaded('act.txt')
			await upload('Файл подписи', new File([signature], 'act.sig'))
			await clickWhenEnabled(verifyButton)
			expect((await verified(emitted)).isDetached).toBe(false)
			expect(callsOf(emulation, 'CadesSignedData.VerifyCades')[0]?.args[2]).toBe(false)
			await removeUploaded('act.sig')
			await waitFor(() => expect(verifyButton()).toBeDisabled())
		})

		it('большой документ — проверка по хэшу ГОСТ 256', async () => {
			const file = bigFile(3000)
			const signature = await signFirst({ data: file, hashThreshold: 1024 })
			const { emitted, emulation } = await renderReady({ props: { mode: 'verify', signature, data: file, hashThreshold: 1024 } })
			await clickWhenEnabled(verifyButton)
			expect(await verified(emitted)).toMatchObject({ isValid: true, isHash: true, isDetached: true })
			expect(callsOf(emulation, 'CadesSignedData.VerifyHash')).toHaveLength(1)
			expect(callsOf(emulation, 'HashedData.propset_Algorithm').map(call => call.args[0])).toEqual([101])
		})

		it('большой документ, ключ 512 — вторая попытка хэшем ГОСТ 512', async () => {
			const file = bigFile(3000)
			const signature = await signFirst({ data: file, hashThreshold: 1024 }, [THUMBPRINTS.ivanov])
			const { emitted, emulation } = await renderReady({ props: { mode: 'verify', signature, data: file, hashThreshold: 1024 } })
			await clickWhenEnabled(verifyButton)
			expect((await verified(emitted)).isValid).toBe(true)
			expect(callsOf(emulation, 'CadesSignedData.VerifyHash')).toHaveLength(2)
			expect(callsOf(emulation, 'HashedData.propset_Algorithm').map(call => call.args[0])).toEqual([101, 102])
		})

		it('большой документ, хэш не совпал ни в одной попытке — ошибка первой попытки', async () => {
			const signature = emulatedSignature({ data: 'другое', detached: true })
			const props = { mode: 'verify', signature, data: bigFile(3000), hashThreshold: 1024 }
			const { emitted, emulation } = await renderReady({ props })
			await clickWhenEnabled(verifyButton)
			const result = await verified(emitted)
			expect(result).toMatchObject({ isValid: false, isHash: true })
			expect(result.error?.detail).toContain('0x80091007')
			expect(callsOf(emulation, 'CadesSignedData.VerifyHash')).toHaveLength(2)
		})

		it('подпись и проверка присоединённой подписи текста XLT1 — круг', async () => {
			const signature = await signFirst({ data: 'Договор № 1', level: 'xlt1', tsaAddress: 'http://tsp.example.ru' })
			const { emitted } = await renderReady({ props: { mode: 'verify', signature } })
			await clickWhenEnabled(verifyButton)
			const result = await verified(emitted)
			expect(result.isValid).toBe(true)
			expect(result.signers[0]?.timeStampTime?.toISOString()).toBe(NOW.toISOString())
		})

		it('плагин недоступен — диагностика с ошибкой, verify() отдаёт null', async () => {
			const props = { mode: 'verify', signature: emulatedSignature({ data: 'x' }) }
			const { api, emulation } = renderExposed(props, { scenario: 'noPlugin' })
			expect(await screen.findByRole('alert')).toHaveTextContent('КриптоПро ЭЦП Browser plug-in не установлен или недоступен')
			expect(screen.queryByRole('button', { name: 'Проверить подпись' })).not.toBeInTheDocument()
			expect(await api().verify()).toBeNull()
			expect(callsOf(emulation, 'CadesSignedData.VerifyCades')).toHaveLength(0)
		})

		it('плагин пропал после диагностики — ошибка окружения событием error, не verified', async () => {
			const { emitted } = await renderReady({ props: { mode: 'verify', signature: emulatedSignature({ data: 'x' }) } })
			await waitFor(() => expect(verifyButton()).toBeEnabled())
			restoreEmulation()
			await userEvent.click(verifyButton())
			await waitFor(() => expect(emitted().error).toBeTruthy())
			expect(lastEmitted<CryptoProFailure>(emitted(), 'error').code).toBe('noPlugin')
			expect(emitted().verified).toBeUndefined()
			const alerts = screen.getAllByRole('alert')
			expect(alerts.some(alert => alert.textContent?.includes('КриптоПро ЭЦП Browser plug-in не установлен или недоступен'))).toBe(
				true,
			)
		})

		it('expose verify() отдаёт результат', async () => {
			const { api } = renderExposed({ mode: 'verify', signature: emulatedSignature({ data: 'x' }) })
			await waitFor(() => expect(verifyButton()).toBeEnabled())
			expect(await api().verify()).toMatchObject({ isValid: true })
		})

		it('isDisabled — поля и кнопка проверки недоступны', async () => {
			await renderReady({ props: { mode: 'verify', isDisabled: true } })
			expect(verifyButton()).toBeDisabled()
			for (const button of screen.getAllByRole('button', { name: /Выберите файл|Выбрать файл/ }))
				expect(button).toHaveAttribute('aria-disabled', 'true')
		})
	})
})
