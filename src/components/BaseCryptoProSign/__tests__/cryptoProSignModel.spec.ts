import '@testing-library/jest-dom/vitest'
import { readyPlugin } from '../model/cades/plugin'
import { signRequest } from '../model/cades/signing'
import { verifySignature } from '../model/cades/verification'
import { render, screen, waitFor } from '@testing-library/vue'
import { record } from '../model/emulation/emulatedSignObjects'
import { hashAlgorithm, hashData } from '../model/cades/hashing'
import { CADES_SIGN, HASH_CHUNK } from '../model/cades/constants'
import { defineComponent, nextTick, reactive, type Ref } from 'vue'
import { useBaseCryptoProSign } from '../model/useBaseCryptoProSign'
import BaseCryptoProSignResult from '../ui/BaseCryptoProSignResult.vue'
import { certificateOption, describeSource } from '../model/cryptoProSignFormat'
import { useBaseCryptoProSignResult } from '../model/useBaseCryptoProSignResult'
import { createCryptoProSignEmulation } from '../model/emulation/cryptoProSignEmulation'
import { CryptoProError, type CryptoProCertificate } from '@composables/crypto/useCryptoPro'
import type { CadesSignPlugin, CadesHashedData, CadesSignSigner } from '../types/cadesSign.types'
import type { BaseCryptoProSignProps, CryptoProVerifySigner } from '../types/BaseCryptoProSign.types'
import { decodeSignature, digestOf, encodeSignature, EMULATED_SIGN_ERRORS } from '../model/emulation/emulatedSignature'
import { NOW, THUMBPRINTS, callsOf, freezeDate, textToBase64, installEmulation, restoreEmulation } from './cryptoProSignTestUtils'

const DAY = 24 * 60 * 60 * 1000

beforeEach(() => freezeDate())

afterEach(() => {
	restoreEmulation()
	vi.useRealTimers()
	vi.restoreAllMocks()
})

function certificate(overrides: Partial<CryptoProCertificate> = {}): CryptoProCertificate {
	return {
		thumbprint: 'AA',
		name: 'Кузнецов Олег',
		commonName: 'Кузнецов Олег',
		organization: '',
		position: '',
		email: '',
		inn: '',
		innLe: '',
		ogrn: '',
		ogrnip: '',
		snils: '',
		issuer: '',
		subject: '',
		serialNumber: '',
		validFrom: new Date(NOW.getTime() - 100 * DAY),
		validTo: new Date(NOW.getTime() + 100 * DAY),
		hasPrivateKey: true,
		isValid: true,
		...overrides,
	} as CryptoProCertificate
}

function signPlugin(options: Parameters<typeof createCryptoProSignEmulation>[0] = {}) {
	const emulation = createCryptoProSignEmulation({ now: NOW, ...options })
	return { emulation, plugin: emulation.plugin as unknown as CadesSignPlugin }
}

async function emulatedSigner(plugin: CadesSignPlugin, thumbprint?: string): Promise<CadesSignSigner> {
	const signer = await plugin.CreateObjectAsync('CAdESCOM.CPSigner')
	if (!thumbprint) return signer
	const store = await plugin.CreateObjectAsync('CAdESCOM.Store')
	const found = await (await store.Certificates).Find(0, thumbprint)
	await signer.propset_Certificate(await found.Item(1))
	return signer
}

describe('BaseCryptoProSign — модель', () => {
	describe('cryptoProSignFormat', () => {
		it('срок: «не проходит проверку», «истекает сегодня»; без ИНН и ФИО — CN', () => {
			const invalid = certificateOption(certificate({ isValid: false }), NOW)
			expect(invalid).toMatchObject({ description: 'не проходит проверку', isDisabled: true })
			const today = certificateOption(certificate({ validTo: new Date(NOW.getTime() + 3600000), name: '', commonName: 'CN' }), NOW)
			expect(today).toMatchObject({ label: 'CN', description: 'истекает сегодня', isDisabled: false })
		})

		it('ИНН юрлица, если нет ИНН физлица', () => {
			expect(certificateOption(certificate({ innLe: '7701234567', organization: 'АО' }), NOW).description).toBe(
				'АО · ИНН 7701234567 · действует до 18.06.2026',
			)
		})

		it('describeSource — текст и файл', () => {
			expect(describeSource('abc', 'x')).toBe('Подписываем текст, 3 Б')
			expect(describeSource(new Blob(['abcd']), 'act')).toBe('Документ: act, 4 Б')
		})
	})

	describe('useBaseCryptoProSignResult и BaseCryptoProSignResult', () => {
		it('без результатов — пусто', () => {
			const result = useBaseCryptoProSignResult({ signResult: null, verifyResult: null })
			expect(result.signedText.value).toBe('')
			expect(result.verifyTitle.value).toBe('Подпись не прошла проверку')
			expect(result.signers.value).toEqual([])
		})

		it('подписант без ИНН и времени подписи — только организация и сертификат', () => {
			const signer = { name: 'Имя', organization: 'Орг', inn: '', thumbprint: 'AA', signingTime: null, timeStampTime: null }
			const verifyResult = {
				isValid: true,
				isDetached: false,
				isHash: false,
				error: null,
				signers: [{ ...signer, isCertificateValid: false, validTo: NOW } as unknown as CryptoProVerifySigner],
			}
			expect(useBaseCryptoProSignResult({ signResult: null, verifyResult }).signers.value[0]?.lines).toEqual([
				'Орг',
				'Сертификат недействителен',
			])
		})

		it('ошибка без текста плагина — показывается сообщение', () => {
			const error = new CryptoProError('unknown', '')
			render(BaseCryptoProSignResult, {
				props: { signResult: null, verifyResult: { isValid: false, isDetached: false, isHash: false, signers: [], error } },
			})
			expect(screen.getByText('Ошибка КриптоПро:')).toBeInTheDocument()
		})
	})

	describe('useBaseCryptoProSign без значений по умолчанию', () => {
		it('detached, level, tsaAddress, hashThreshold и прогресс без пропсов', async () => {
			const emulation = installEmulation()
			const props = reactive<BaseCryptoProSignProps>({ mode: 'sign', data: new Blob(['abc']) })
			let model: ReturnType<typeof useBaseCryptoProSign> | null = null
			render(
				defineComponent({
					setup() {
						model = useBaseCryptoProSign(props, (() => undefined) as never)
						return () => null
					},
				}),
			)
			const api = model as unknown as ReturnType<typeof useBaseCryptoProSign>
			expect(api.detachedValue.value).toBe('attached')
			props.detached = true
			await nextTick()
			expect(api.detachedValue.value).toBe('detached')
			props.detached = undefined
			await nextTick()
			expect(api.detachedValue.value).toBe('attached')
			expect(api.isHash.value).toBe(false)
			expect(api.hashHint.value).toBe('Документ больше 0 Б: подписывается его хэш, подпись только отсоединённая')
			expect(api.progressPercent.value).toBe(0)
			api.download()
			props.data = 'текст'
			await waitFor(() => expect((api.thumbprintValue as Ref<string>).value).toBe(THUMBPRINTS.ivanov))
			expect(await api.sign()).toMatchObject({ level: 'bes', detached: false, isHash: false })
			expect(callsOf(emulation, 'CPSigner.propset_TSAAddress')).toHaveLength(0)
			props.data = undefined
			expect(api.sourceText.value).toBe('')
		})
	})

	describe('cades', () => {
		it('readyPlugin без window.cadesplugin — noPlugin', () => {
			expect(() => readyPlugin()).toThrow(expect.objectContaining({ code: 'noPlugin' }))
		})

		it('hashAlgorithm без открытого ключа — ГОСТ 256', async () => {
			expect(await hashAlgorithm({} as never)).toBe(CADES_SIGN.HASH_GOST_2012_256)
		})

		it('hashData — строка частями и пустые данные одним вызовом', async () => {
			const { plugin, emulation } = signPlugin()
			const progress: number[] = []
			await hashData(plugin, 'x'.repeat(HASH_CHUNK + 3), { algorithm: 101, onProgress: value => progress.push(value) })
			expect(progress).toEqual([0, HASH_CHUNK / (HASH_CHUNK + 3), 1, 1])
			const empty = await hashData(plugin, new Blob([]), { algorithm: 102 })
			expect(callsOf(emulation, 'HashedData.Hash').map(call => call.args[0])).toEqual([1048576, 4, 0])
			expect(await empty.Value).toMatch(/^[0-9A-F]{128}$/)
		})

		it('signRequest — CryptoProError закрытого ключа и закрытие хранилища', async () => {
			const { plugin, emulation } = signPlugin()
			const request = {
				data: 'x',
				thumbprint: THUMBPRINTS.smirnov,
				detached: false,
				level: 'bes',
				tsaAddress: '',
				isHash: false,
			} as const
			await expect(signRequest(plugin, request)).rejects.toMatchObject({ code: 'noPrivateKey' })
			expect(callsOf(emulation, 'Store.Close')).toHaveLength(1)
		})

		it('verifySignature — даты строками, ошибки статуса и сертификата, ИНН юрлица', async () => {
			const certificate = {
				SubjectName: Promise.resolve('CN=Орг, O=Орг, INNLE=7701234567'),
				IssuerName: Promise.resolve('CN=УЦ'),
				Thumbprint: Promise.resolve('ab'),
				ValidToDate: Promise.resolve(new Date('2027-01-01T00:00:00Z')),
				IsValid: () => Promise.reject(new Error('нет')),
			}
			const signer = {
				Certificate: Promise.resolve(certificate),
				SigningTime: Promise.resolve('2026-03-10T09:00:00Z'),
				SignatureTimeStampTime: Promise.reject(new Error('нет штампа')),
				SignatureStatus: Promise.reject(new Error('нет статуса')),
			}
			const signedData = {
				VerifyCades: vi.fn(async () => undefined),
				Signers: Promise.resolve({ Count: Promise.resolve(1), Item: async () => signer }),
			}
			const plugin = { CreateObjectAsync: async () => signedData } as unknown as CadesSignPlugin
			const [result] = await verifySignature(plugin, { signature: 'AAAA', isHash: false })
			expect(result).toMatchObject({
				name: 'Орг',
				inn: '7701234567',
				thumbprint: 'AB',
				issuer: 'УЦ',
				timeStampTime: null,
				isSignatureValid: false,
				isCertificateValid: false,
			})
			expect(result?.validTo.toISOString()).toBe('2027-01-01T00:00:00.000Z')
			expect(result?.signingTime?.toISOString()).toBe('2026-03-10T09:00:00.000Z')
		})

		it('verifySignature по хэшу без данных — хэш пустых данных', async () => {
			const { plugin, emulation } = signPlugin()
			const content = ''
			const signature = encodeSignature({
				level: 'BES',
				detached: true,
				thumbprint: THUMBPRINTS.ivanov,
				digest: digestOf(content),
				signingTime: '',
				timeStamp: '',
				content,
			})
			const [signer] = await verifySignature(plugin, { signature, isHash: true })
			expect(signer?.signingTime).toBeNull()
			expect(callsOf(emulation, 'HashedData.Hash')[0]?.args).toEqual([0])
		})
	})

	describe('эмуляция', () => {
		it('без настроек — сертификаты от текущего времени; install поверх другой эмуляции возвращает прежнюю', async () => {
			const first = createCryptoProSignEmulation()
			const second = createCryptoProSignEmulation()
			const restoreFirst = first.install()
			const restoreSecond = second.install()
			expect((window as unknown as { cadesplugin: unknown }).cadesplugin).toBe(second.plugin)
			restoreSecond()
			expect((window as unknown as { cadesplugin: unknown }).cadesplugin).toBe(first.plugin)
			restoreFirst()
			expect('cadesplugin' in window).toBe(false)
		})

		it('noCsp — объекты подписи не создаются', async () => {
			const { plugin, emulation } = signPlugin({ scenario: 'noCsp' })
			await expect(plugin.CreateObjectAsync('CAdESCOM.HashedData')).rejects.toThrow('0x80070002')
			await expect(plugin.CreateObjectAsync('CAdESCOM.CPAttribute')).rejects.toThrow('0x80070002')
			expect(callsOf(emulation, 'cadesplugin.CreateObjectAsync').map(call => call.args[0])).toEqual([
				'CAdESCOM.HashedData',
				'CAdESCOM.CPAttribute',
			])
		})

		it('record — имя без точки не проходит тип; объект — до первой точки, член — всё после неё', () => {
			expectTypeOf<'Hash'>().not.toExtend<Parameters<typeof record>[1]>()
			expectTypeOf<''>().not.toExtend<Parameters<typeof record>[1]>()
			const calls: Array<{ object: string; member: string; args: unknown[] }> = []
			record({ calls } as never, 'HashedData.Hash', [])
			record({ calls } as never, 'CPSigner.AuthenticatedAttributes2.Add', ['CPAttribute'])
			expect(calls).toEqual([
				{ object: 'HashedData', member: 'Hash', args: [] },
				{ object: 'CPSigner', member: 'AuthenticatedAttributes2.Add', args: ['CPAttribute'] },
			])
		})

		it('атрибут не из эмуляции и значение не Date; подпись без времени и с неизвестным типом', async () => {
			const { plugin, emulation } = signPlugin()
			const attribute = await plugin.CreateObjectAsync('CAdESCOM.CPAttribute')
			await attribute.propset_Value('2026-03-10' as never)
			expect(callsOf(emulation, 'CPAttribute.propset_Value')[0]?.args).toEqual(['2026-03-10'])
			const signer = await emulatedSigner(plugin, THUMBPRINTS.ivanov)
			await (await signer.AuthenticatedAttributes2).Add({} as never)
			await signer.propset_TSAAddress('http://tsp.example.ru')
			const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
			const signature = decodeSignature(await signedData.SignCades(signer, 99, false))
			expect(signature).toMatchObject({ level: 'BES', signingTime: '', timeStamp: '' })
		})

		it('ошибки подписи эмуляции: нет сертификата, нет ключа, просрочен', async () => {
			const { plugin } = signPlugin()
			const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
			await expect(signedData.SignCades(await emulatedSigner(plugin), 1, false)).rejects.toThrow('0x80092004')
			await expect(signedData.SignCades({} as never, 1, false)).rejects.toThrow('0x80092004')
			await expect(signedData.SignCades(await emulatedSigner(plugin, THUMBPRINTS.smirnov), 1, false)).rejects.toThrow('0x8009200B')
			await expect(signedData.SignCades(await emulatedSigner(plugin, THUMBPRINTS.sidorova), 1, false)).rejects.toThrow('0x800B0101')
		})

		it('SignHash с чужим хэшем — пустой хэш в подписи; Value хэша — шестнадцатеричная строка', async () => {
			const { plugin } = signPlugin()
			const hashed = await plugin.CreateObjectAsync('CAdESCOM.HashedData')
			expect(await hashed.Value).toMatch(/^[0-9A-F]{64}$/)
			const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
			const foreign = {} as CadesHashedData
			const signature = await signedData.SignHash(foreign, await emulatedSigner(plugin, THUMBPRINTS.ivanov), 1)
			expect(decodeSignature(signature).digest).toBe('')
		})

		it('VerifyHash: присоединённая подпись или чужой хэш — неверно', async () => {
			const { plugin } = signPlugin()
			const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
			const attached = encodeSignature({ ...decodeSignature(btoa('RISE-EMULATED-CADES-BES')), detached: false })
			await expect(signedData.VerifyHash({} as CadesHashedData, attached, 1)).rejects.toThrow(EMULATED_SIGN_ERRORS.badHash)
			const detached = encodeSignature({ ...decodeSignature(btoa('RISE-EMULATED-CADES-BES')), detached: true, digest: '256:00' })
			await expect(signedData.VerifyHash({} as CadesHashedData, detached, 1)).rejects.toThrow(EMULATED_SIGN_ERRORS.badHash)
		})

		it('VerifyCades: присоединённая подпись с хэшем 512 и подписант с неизвестным сертификатом', async () => {
			const { plugin } = signPlugin()
			const content = textToBase64('Привет')
			const signature = encodeSignature({
				level: 'T',
				detached: false,
				thumbprint: 'FFFF',
				digest: digestOf(content, 512),
				signingTime: NOW.toISOString(),
				timeStamp: NOW.toISOString(),
				content,
			})
			const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
			await signedData.VerifyCades(signature, 1, false)
			const signer = await (await signedData.Signers).Item(1)
			await expect(signer.Certificate).rejects.toThrow('0x80092004')
			expect(await signer.SignatureTimeStampTime).toEqual(NOW)
		})

		it('decodeSignature: не Base64 и подпись без полей', () => {
			expect(() => decodeSignature('%%%')).toThrow(EMULATED_SIGN_ERRORS.badFormat)
			expect(decodeSignature(btoa('RISE-EMULATED-CADES-T'))).toEqual({
				level: 'T',
				detached: false,
				thumbprint: '',
				digest: '',
				signingTime: '',
				timeStamp: '',
				content: '',
			})
		})
	})
})
