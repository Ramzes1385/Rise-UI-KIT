/** Утилиты: тестовые сертификаты эмуляции КриптоПро — действующий, истекающий, просроченный и без закрытого ключа */
import type { CryptoProEmulatedCertificate } from '../types/cryptoProEmulation.types'

const DAY = 24 * 60 * 60 * 1000

const ISSUER = 'CN="Тестовый УЦ ООО ""КРИПТО-ПРО""", O="ООО ""КРИПТО-ПРО""", L=Москва, C=RU'

function shift(now: Date, days: number): Date {
	return new Date(now.getTime() + days * DAY)
}

/**
 * Сертификаты эмуляции относительно `now`: руководитель организации (действует ещё полгода), ИП (истекает через 10 дней),
 * физлицо (истёк 30 дней назад) и сертификат без закрытого ключа
 */
export function emulatedCertificates(now: Date): CryptoProEmulatedCertificate[] {
	return [
		{
			thumbprint: 'A1B2C3D4E5F60718293A4B5C6D7E8F9012345678',
			subject:
				'CN="ООО ""Ромашка""", SN=Иванов, G=Иван Иванович, T=Генеральный директор, O="ООО ""Ромашка""", L=Москва, C=RU, ' +
				'E=ivanov@example.ru, ИНН ЮЛ=7712345678, ОГРН=1027700132195, СНИЛС=12345678901, ИНН=771234567890',
			issuer: ISSUER,
			serialNumber: '01DA1B2C3D4E5F6000000000000A0001',
			validFrom: shift(now, -180),
			validTo: shift(now, 185),
			hasPrivateKey: true,
		},
		{
			thumbprint: 'B2C3D4E5F60718293A4B5C6D7E8F901234567890',
			subject:
				'CN=Петров Пётр Петрович, SN=Петров, G=Пётр Петрович, C=RU, ОГРНИП=304770000123456, СНИЛС=23456789012, ИНН=772345678901',
			issuer: ISSUER,
			serialNumber: '01DA1B2C3D4E5F6000000000000A0002',
			validFrom: shift(now, -355),
			validTo: shift(now, 10),
			hasPrivateKey: true,
		},
		{
			thumbprint: 'C3D4E5F60718293A4B5C6D7E8F90123456789012',
			subject:
				'CN=Сидорова Анна Сергеевна, SN=Сидорова, G=Анна Сергеевна, C=RU, OID.1.2.643.100.3=34567890123, OID.1.2.643.3.131.1.1=773456789012',
			issuer: ISSUER,
			serialNumber: '01DA1B2C3D4E5F6000000000000A0003',
			validFrom: shift(now, -395),
			validTo: shift(now, -30),
			hasPrivateKey: true,
		},
		{
			thumbprint: 'D4E5F60718293A4B5C6D7E8F9012345678901234',
			subject:
				'CN=Смирнов Алексей Викторович, SN=Смирнов, G=Алексей Викторович, O=АО "Вектор", C=RU, INNLE=7701234567, OGRN=1157746000000',
			issuer: ISSUER,
			serialNumber: '01DA1B2C3D4E5F6000000000000A0004',
			validFrom: shift(now, -30),
			validTo: shift(now, 335),
			hasPrivateKey: false,
		},
	]
}
