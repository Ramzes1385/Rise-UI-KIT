/** Утилиты: константы КриптоПро ЭЦП Browser plug-in — те же значения, что в `cadesplugin_api.js` */

/** Хранилище и поиск сертификатов, тип и кодировка подписи */
export const CADES = {
	/** `CAPICOM_CURRENT_USER_STORE` — хранилище текущего пользователя */
	CURRENT_USER_STORE: 2,
	/** `CAPICOM_MY_STORE` — личные сертификаты */
	MY_STORE: 'My',
	/** `CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED` */
	STORE_OPEN_MAXIMUM_ALLOWED: 2,
	/** `CAPICOM_CERTIFICATE_FIND_SHA1_HASH` — поиск по отпечатку */
	FIND_SHA1_HASH: 0,
	/** `CADESCOM_CADES_BES` — базовая подпись CAdES */
	CADES_BES: 1,
	/** `CADESCOM_BASE64_TO_BINARY` — содержимое передаётся Base64, подписываются байты */
	BASE64_TO_BINARY: 1,
	/** `PROV_GOST_2012_256` — тип криптопровайдера ГОСТ Р 34.10-2012 */
	PROVIDER_GOST_2012: 80,
} as const
