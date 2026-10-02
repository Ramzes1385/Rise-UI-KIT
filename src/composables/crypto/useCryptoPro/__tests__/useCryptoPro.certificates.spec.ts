import { useCryptoPro, emulatedCertificates, createCryptoProEmulation, type CryptoProEmulation } from '..'
import { NOW, IVANOV, cleanup, install, fakeStore, customPlugin, fakeCertificate } from './cryptoProFakes'

const DAY = 24 * 60 * 60 * 1000

function withStore(store: ReturnType<typeof fakeStore>['store']): void {
	install(customPlugin(createCryptoProEmulation().plugin, { objects: { 'CAdESCOM.Store': async () => store } }))
}

async function readSubject(subject: string) {
	withStore(fakeStore([fakeCertificate({ subject })]).store)
	const [certificate] = await useCryptoPro().getCertificates()
	return certificate
}

afterEach(cleanup)

describe('useCryptoPro — сертификаты', () => {
	let emulation: CryptoProEmulation

	beforeEach(() => {
		emulation = createCryptoProEmulation({ now: NOW })
		emulation.install()
	})

	it('getCertificates — все сертификаты хранилища, isLoading на время чтения, хранилище закрывается', async () => {
		const { certificates, isLoading, getCertificates, error } = useCryptoPro()
		const loading = getCertificates()
		expect(isLoading.value).toBe(true)
		const list = await loading
		expect(isLoading.value).toBe(false)
		expect(list).toHaveLength(4)
		expect(certificates.value).toBe(list)
		expect(error.value).toBeNull()
		expect(emulation.calls).toContainEqual({ object: 'Store', member: 'Open', args: [2, 'My', 2] })
		expect(emulation.calls[emulation.calls.length - 1]).toEqual({ object: 'Store', member: 'Close', args: [] })
	})

	it('руководитель организации — ФИО, организация без удвоенных кавычек, ИНН, ИНН ЮЛ, ОГРН, СНИЛС, сроки', async () => {
		const [ivanov] = await useCryptoPro().getCertificates()
		expect(ivanov).toEqual({
			thumbprint: IVANOV,
			name: 'Иванов Иван Иванович',
			commonName: 'ООО "Ромашка"',
			organization: 'ООО "Ромашка"',
			position: 'Генеральный директор',
			email: 'ivanov@example.ru',
			inn: '771234567890',
			innLe: '7712345678',
			ogrn: '1027700132195',
			ogrnip: '',
			snils: '12345678901',
			issuer: 'Тестовый УЦ ООО "КРИПТО-ПРО"',
			subject: expect.stringContaining('SN=Иванов'),
			serialNumber: '01DA1B2C3D4E5F6000000000000A0001',
			validFrom: new Date(NOW.getTime() - 180 * DAY),
			validTo: new Date(NOW.getTime() + 185 * DAY),
			hasPrivateKey: true,
			isValid: true,
		})
	})

	it('ИП — ОГРНИП без организации; физлицо — СНИЛС и ИНН из OID, просрочен', async () => {
		const [, petrov, sidorova] = await useCryptoPro().getCertificates()
		expect(petrov).toMatchObject({ name: 'Петров Пётр Петрович', ogrnip: '304770000123456', organization: '', ogrn: '' })
		expect(petrov?.validTo).toEqual(new Date(NOW.getTime() + 10 * DAY))
		expect(sidorova).toMatchObject({ snils: '34567890123', inn: '773456789012', isValid: false })
	})

	it('латинские имена полей, кавычки внутри значения, нет закрытого ключа', async () => {
		const [, , , smirnov] = await useCryptoPro().getCertificates()
		expect(smirnov).toMatchObject({
			name: 'Смирнов Алексей Викторович',
			organization: 'АО "Вектор"',
			innLe: '7701234567',
			ogrn: '1157746000000',
			hasPrivateKey: false,
			isValid: true,
		})
	})

	it('отпечаток — заглавными', async () => {
		const [first] = emulatedCertificates(NOW)
		createCryptoProEmulation({ now: NOW, certificates: [{ ...first!, thumbprint: IVANOV.toLowerCase() }] }).install()
		const [certificate] = await useCryptoPro().getCertificates()
		expect(certificate?.thumbprint).toBe(IVANOV)
	})

	it('пустое хранилище — [] и ошибка noCertificates без исключения', async () => {
		createCryptoProEmulation({ scenario: 'noCertificates' }).install()
		const { certificates, error, getCertificates } = useCryptoPro()
		await expect(getCertificates()).resolves.toEqual([])
		expect(certificates.value).toEqual([])
		expect(error.value?.code).toBe('noCertificates')
		expect(error.value?.message).toBe('В личном хранилище нет сертификатов')
	})

	it('повторное чтение не повторяет диагностику', async () => {
		const { check, getCertificates } = useCryptoPro()
		await check()
		await getCertificates()
		await getCertificates()
		const abouts = emulation.calls.filter(call => call.args[0] === 'CAdESCOM.About')
		expect(abouts).toHaveLength(1)
	})

	it('диагностика не прошла — getCertificates бросает её ошибку и кладёт в error', async () => {
		createCryptoProEmulation({ scenario: 'noCsp' }).install()
		const { error, isLoading, getCertificates } = useCryptoPro()
		await expect(getCertificates()).rejects.toMatchObject({ code: 'noCsp' })
		expect(error.value?.code).toBe('noCsp')
		expect(isLoading.value).toBe(false)
	})

	it('без скрипта — ошибка noScript', async () => {
		cleanup()
		const { error, getCertificates } = useCryptoPro()
		await expect(getCertificates()).rejects.toMatchObject({ code: 'noScript' })
		expect(error.value?.code).toBe('noScript')
	})
})

describe('useCryptoPro — данные сертификата от плагина', () => {
	it('даты объектами Date (NPAPI)', async () => {
		withStore(fakeStore([fakeCertificate({})]).store)
		const [certificate] = await useCryptoPro().getCertificates()
		expect(certificate?.validFrom).toEqual(new Date('2026-01-01T00:00:00.000Z'))
		expect(certificate?.validTo).toEqual(new Date('2027-01-01T00:00:00.000Z'))
	})

	it('подпись: сертификат найден в хранилище, а плагин его не знает — certificateNotFound от плагина', async () => {
		withStore(fakeStore([fakeCertificate({})]).store)
		await expect(useCryptoPro().sign('a', { thumbprint: 'FF00' })).rejects.toMatchObject({
			code: 'certificateNotFound',
			detail: expect.stringContaining('0x80092004'),
		})
	})

	it('IsValid бросает — isValid false', async () => {
		withStore(fakeStore([fakeCertificate({ IsValid: () => Promise.reject(new Error('цепочка')) })]).store)
		const [certificate] = await useCryptoPro().getCertificates()
		expect(certificate?.isValid).toBe(false)
	})

	it('ошибка закрытия хранилища не мешает результату', async () => {
		const { store, closed } = fakeStore([fakeCertificate({})], { close: () => Promise.reject(new Error('close')) })
		withStore(store)
		await expect(useCryptoPro().getCertificates()).resolves.toHaveLength(1)
		expect(closed).toHaveBeenCalledTimes(1)
	})

	it('ошибка чтения — хранилище всё равно закрывается, ошибка в error', async () => {
		const { store, closed } = fakeStore([], { certificates: () => Promise.reject(new Error('Сбой чтения')) })
		withStore(store)
		const { error, getCertificates } = useCryptoPro()
		await expect(getCertificates()).rejects.toMatchObject({ code: 'unknown', message: 'Ошибка КриптоПро: Сбой чтения' })
		expect(error.value?.detail).toBe('Сбой чтения')
		expect(closed).toHaveBeenCalledTimes(1)
	})

	it('без SN и G — имя из CN; отсутствующие поля пустые', async () => {
		const certificate = await readSubject('CN=Просто Имя, C=RU')
		expect(certificate).toMatchObject({ name: 'Просто Имя', commonName: 'Просто Имя', organization: '', inn: '', snils: '', email: '' })
	})

	it('только SN — имя из фамилии', async () => {
		expect((await readSubject('CN=Общее, SN=Фамилия'))?.name).toBe('Фамилия')
	})

	it('части без «=», пустые и незакрытые кавычки, e-mail по OID', async () => {
		const certificate = await readSubject('мусор, =без имени, CN=Имя, T=, 1.2.840.113549.1.9.1=a@b.ru, O="Кавычка')
		expect(certificate).toMatchObject({ commonName: 'Имя', position: '', email: 'a@b.ru', organization: '"Кавычка' })
	})

	it('регистр и пробелы имён полей, OID-префикс в любом регистре', async () => {
		const certificate = await readSubject(
			' cn = Имя ,  inn=123, oid.1.2.643.100.1=456, Email=x@y.ru, Title=Инженер, GivenName=Анна, Surname=Иванова',
		)
		expect(certificate).toMatchObject({
			commonName: 'Имя',
			inn: '123',
			ogrn: '456',
			email: 'x@y.ru',
			position: 'Инженер',
			name: 'Иванова Анна',
		})
	})
})
