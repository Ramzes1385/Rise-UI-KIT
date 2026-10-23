import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import type { CadesSignPlugin } from '../../types/cadesSign.types'
import { createCryptoProSignEmulation } from '../../model/emulation/cryptoProSignEmulation'
import type { CryptoProSignResult, CryptoProVerifyResult } from '../../types/BaseCryptoProSign.types'
import { EMULATED_SIGN_ERRORS, decodeSignature, digestOf, encodeSignature } from '../../model/emulation/emulatedSignature'
import { NOW, THUMBPRINTS, callsOf, freezeDate, lastEmitted, renderReady, textToBase64, restoreEmulation } from '../cryptoProSignTestUtils'

beforeEach(() => freezeDate())

afterEach(() => {
	restoreEmulation()
	vi.useRealTimers()
	vi.restoreAllMocks()
})

function emulatedSignature(data: string, detached: boolean, thumbprint = THUMBPRINTS.petrov): string {
	const content = textToBase64(data)
	return encodeSignature({
		level: 'BES',
		detached,
		thumbprint,
		digest: digestOf(content),
		signingTime: NOW.toISOString(),
		timeStamp: '',
		content: detached ? '' : content,
	})
}

function coSignButton(): HTMLElement {
	return screen.getByRole('button', { name: 'Добавить подпись' })
}

async function coSign(emitted: () => Record<string, unknown[][]>): Promise<CryptoProSignResult> {
	await waitFor(() => expect(coSignButton()).toBeEnabled())
	await userEvent.click(coSignButton())
	await waitFor(() => expect(emitted().signed).toBeTruthy())
	return lastEmitted<CryptoProSignResult>(emitted(), 'signed')
}

async function upload(label: string, file: File): Promise<void> {
	const input = screen.getByLabelText(label, { selector: 'input' }) as HTMLInputElement
	Object.defineProperty(input, 'files', { value: [file], configurable: true })
	await fireEvent.change(input)
}

describe('BaseCryptoProSign — вторая подпись (mode="cosign")', () => {
	it('область, выбор сертификата, без переключателя типа; без подписи кнопка недоступна', async () => {
		await renderReady({ props: { mode: 'cosign' } })
		expect(screen.getByRole('region', { name: 'Добавление электронной подписи' })).toBeInTheDocument()
		await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('Иванов Иван Иванович'))
		expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
		expect(screen.getByLabelText('Файл подписи', { selector: 'input' })).toBeInTheDocument()
		expect(coSignButton()).toBeDisabled()
	})

	it('присоединённая подпись: VerifyCades и CoSignCades, итог содержит обоих подписантов', async () => {
		const existing = emulatedSignature('Привет', false)
		const { emitted, emulation } = await renderReady({ props: { mode: 'cosign', signature: existing } })
		expect(screen.getByText('Подпись для проверки получена')).toBeInTheDocument()
		const result = await coSign(emitted)
		expect(result).toMatchObject({ isCoSign: true, detached: false, isHash: false, fileName: 'document' })
		expect(callsOf(emulation, 'CadesSignedData.VerifyCades')[0]?.args).toEqual([existing.length, 1, false])
		expect(callsOf(emulation, 'CadesSignedData.CoSignCades')[0]?.args).toEqual(['CPSigner', 1])
		expect(callsOf(emulation, 'CadesSignedData.SignCades')).toHaveLength(0)
		expect(callsOf(emulation, 'CadesSignedData.propset_Content')).toHaveLength(0)
		const decoded = decodeSignature(result.signature)
		expect(decoded.thumbprint).toBe(THUMBPRINTS.petrov)
		expect(decoded.cosigners).toBe(`${THUMBPRINTS.ivanov}~${NOW.toISOString()}~`)
		expect(screen.getByText('Подпись добавлена: document.sig', { selector: '.base-crypto-pro-sign-result__title' })).toBeInTheDocument()
		expect(document.querySelector('.base-crypto-pro-sign__live')).toHaveTextContent('Подпись добавлена: document.sig')
		expect(screen.getByRole('button', { name: 'Скачать подпись' })).toBeInTheDocument()
	})

	it('отсоединённая подпись: документ передаётся, уровень t — штамп времени второго подписанта', async () => {
		const existing = emulatedSignature('Привет', true)
		const props = { mode: 'cosign', signature: existing, data: 'Привет', level: 't', tsaAddress: 'http://tsp.example.ru' }
		const { emitted, emulation } = await renderReady({ props })
		expect(screen.getByText('Добавляем подпись к тексту, 12 Б')).toBeInTheDocument()
		const result = await coSign(emitted)
		expect(result).toMatchObject({ isCoSign: true, detached: true, level: 't' })
		expect(callsOf(emulation, 'CadesSignedData.propset_Content')[0]?.args).toEqual([textToBase64('Привет')])
		expect(callsOf(emulation, 'CadesSignedData.VerifyCades')[0]?.args).toEqual([existing.length, 1, true])
		expect(callsOf(emulation, 'CadesSignedData.CoSignCades')[0]?.args).toEqual(['CPSigner', 5])
		expect(decodeSignature(result.signature).cosigners).toBe(`${THUMBPRINTS.ivanov}~${NOW.toISOString()}~${NOW.toISOString()}`)
	})

	it('файл больше hashThreshold — VerifyHash и CoSignHash', async () => {
		const file = new File([new Uint8Array(4096).fill(7)], 'scan.pdf')
		const first = await renderReady({ props: { data: file, hashThreshold: 1024 } })
		await waitFor(() => expect(screen.getByRole('button', { name: 'Подписать' })).toBeEnabled())
		await userEvent.click(screen.getByRole('button', { name: 'Подписать' }))
		await waitFor(() => expect(first.emitted().signed).toBeTruthy())
		const existing = lastEmitted<CryptoProSignResult>(first.emitted(), 'signed').signature
		first.unmount()
		restoreEmulation()

		const props = { mode: 'cosign', signature: existing, data: file, hashThreshold: 1024 }
		const { emitted, emulation } = await renderReady({ props })
		const result = await coSign(emitted)
		expect(result).toMatchObject({ isCoSign: true, isHash: true, detached: true, fileName: 'scan.pdf' })
		expect(callsOf(emulation, 'CadesSignedData.VerifyHash')[0]?.args).toEqual(['HashedData', existing.length, 1])
		expect(callsOf(emulation, 'CadesSignedData.CoSignHash')[0]?.args).toEqual(['HashedData', 'CPSigner', 1])
		expect(decodeSignature(result.signature).cosigners).toContain(THUMBPRINTS.ivanov)
	})

	it('подпись и документ выбираются файлами; подпись другого документа — ошибка', async () => {
		const { emitted } = await renderReady({ props: { mode: 'cosign' } })
		await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('Иванов Иван Иванович'))
		await upload('Файл подписи', new File([emulatedSignature('Привет', true)], 'act.sig'))
		await upload('Подписанный документ — для отсоединённой подписи', new File(['Другой текст'], 'act.txt'))
		await waitFor(() => expect(coSignButton()).toBeEnabled())
		await userEvent.click(coSignButton())
		await waitFor(() => expect(emitted().error).toBeTruthy())
		expect(emitted().signed).toBeUndefined()
	})

	it('проверка видит обоих подписантов', async () => {
		const existing = emulatedSignature('Привет', false)
		const first = await renderReady({ props: { mode: 'cosign', signature: existing } })
		const { signature } = await coSign(first.emitted)
		first.unmount()
		restoreEmulation()

		const view = await renderReady({ props: { mode: 'verify', signature } })
		await waitFor(() => expect(screen.getByRole('button', { name: 'Проверить подпись' })).toBeEnabled())
		await userEvent.click(screen.getByRole('button', { name: 'Проверить подпись' }))
		await waitFor(() => expect(view.emitted().verified).toBeTruthy())
		const verified = lastEmitted<CryptoProVerifyResult>(view.emitted(), 'verified')
		expect(verified.isValid).toBe(true)
		expect(verified.signers.map(signer => signer.thumbprint)).toEqual([THUMBPRINTS.petrov, THUMBPRINTS.ivanov])
	})
})

describe('эмуляция второй подписи', () => {
	async function signerOf(plugin: CadesSignPlugin, thumbprint: string) {
		const signer = await plugin.CreateObjectAsync('CAdESCOM.CPSigner')
		const found = await (await (await plugin.CreateObjectAsync('CAdESCOM.Store')).Certificates).Find(0, thumbprint)
		await signer.propset_Certificate(await found.Item(1))
		return signer
	}

	it('CoSignCades без проверки подписи — ошибка формата; третья подпись добавляется через запятую', async () => {
		const plugin = createCryptoProSignEmulation({ now: NOW }).plugin as unknown as CadesSignPlugin
		const bare = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
		await expect(bare.CoSignCades(await signerOf(plugin, THUMBPRINTS.ivanov), 1)).rejects.toThrow(EMULATED_SIGN_ERRORS.badFormat)

		let signature = emulatedSignature('Привет', false)
		for (const thumbprint of [THUMBPRINTS.ivanov, THUMBPRINTS.petrov]) {
			const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
			await signedData.VerifyCades(signature, 1, false)
			signature = await signedData.CoSignCades(await signerOf(plugin, thumbprint), 1)
		}
		expect((decodeSignature(signature).cosigners ?? '').split(',')).toHaveLength(2)
	})
})
