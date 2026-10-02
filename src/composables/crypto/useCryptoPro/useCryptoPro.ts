import { CryptoProError, toCryptoProError } from './core/errors'
import { CRYPTO_PRO_STEP_IDS } from './types/useCryptoPro.types'
import type { CadesPlugin, CadesPluginHandle } from './types/cadesplugin.types'
/** Composable: КриптоПро ЭЦП Browser plug-in — диагностика, сертификаты, присоединённая и отсоединённая подпись CAdES-BES */
import { computed, getCurrentInstance, markRaw, onMounted, reactive, readonly, ref, shallowRef, toValue, type Ref } from 'vue'
import type {
	CryptoProStatus,
	CryptoProSignData,
	UseCryptoProOptions,
	CryptoProCertificate,
	CryptoProSignOptions,
} from './types/useCryptoPro.types'

const DEFAULT_TIMEOUT = 30000

/** Код работы с плагином — отдельный чанк: приложение, которое только импортирует вход, его не загружает */
const loadPlugin = () => import('./core/plugin')

function initialStatus(): CryptoProStatus {
	return {
		state: 'idle',
		steps: CRYPTO_PRO_STEP_IDS.map(id => ({ id, state: 'pending' })),
		pluginVersion: '',
		cspVersion: '',
		cspName: '',
		error: null,
	}
}

function useDiagnostics(options: UseCryptoProOptions) {
	const status = reactive<CryptoProStatus>(initialStatus())
	let handle: CadesPluginHandle | undefined
	let running: Promise<CadesPluginHandle> | null = null

	async function run(): Promise<CadesPluginHandle> {
		Object.assign(status, initialStatus(), { state: 'checking' })
		try {
			const { runDiagnostics } = await loadPlugin()
			handle = await runDiagnostics({ scriptUrl: toValue(options.scriptUrl), timeout: options.timeout ?? DEFAULT_TIMEOUT, status })
			status.state = 'ready'
			return handle
		} catch (error) {
			const failed = markRaw(toCryptoProError(error, handle?.plugin))
			Object.assign(status, { state: 'error', error: failed })
			throw failed
		}
	}

	function check(): Promise<CadesPluginHandle> {
		running ??= run().finally(() => {
			running = null
		})
		return running
	}

	return {
		status,
		check,
		plugin: (): CadesPlugin | undefined => handle?.plugin,
		ready: (): Promise<CadesPluginHandle> => (handle && status.state === 'ready' ? Promise.resolve(handle) : check()),
	}
}

function useOperations(diagnostics: ReturnType<typeof useDiagnostics>) {
	const certificates = shallowRef<CryptoProCertificate[]>([])
	const error = shallowRef<CryptoProError | null>(null)
	const isLoading = ref(false)
	const isSigning = ref(false)

	async function guarded<T>(flag: Ref<boolean>, action: (plugin: CadesPlugin) => Promise<T>): Promise<T> {
		flag.value = true
		error.value = null
		try {
			return await action((await diagnostics.ready()).plugin)
		} catch (caught) {
			error.value = markRaw(toCryptoProError(caught, diagnostics.plugin()))
			throw error.value
		} finally {
			flag.value = false
		}
	}

	async function getCertificates(): Promise<CryptoProCertificate[]> {
		const list = await guarded(isLoading, async plugin => (await loadPlugin()).listCertificates(plugin))
		certificates.value = list
		if (list.length === 0) error.value = markRaw(new CryptoProError('noCertificates'))
		return list
	}

	function sign(data: CryptoProSignData, options: CryptoProSignOptions): Promise<string> {
		return guarded(isSigning, async plugin => (await loadPlugin()).signData(plugin, data, options))
	}

	return { certificates, error, isLoading, isSigning, getCertificates, sign }
}

/**
 * Описание: адаптер КриптоПро ЭЦП Browser plug-in без npm-пакетов — только асинхронный API (`CreateObjectAsync`, `propset_*`).
 * Скрипт `cadesplugin_api.js` приложение подключает само или передаёт `scriptUrl`; до `onMounted` composable ничего не трогает (SSR).
 * `check()` — диагностика по шагам (`status`), `getCertificates()` — личные сертификаты, `sign()` — подпись CAdES-BES в Base64.
 * Ошибки — `CryptoProError` с кодом и текстом из словаря; последняя ошибка сертификатов и подписи — в `error`
 */
export function useCryptoPro(options: UseCryptoProOptions = {}) {
	const diagnostics = useDiagnostics(options)
	const operations = useOperations(diagnostics)
	const check = (): Promise<boolean> =>
		diagnostics.check().then(
			() => true,
			() => false,
		)
	if (options.checkOnMount !== false && getCurrentInstance()) onMounted(() => void check())
	return {
		status: readonly(diagnostics.status),
		isReady: computed(() => diagnostics.status.state === 'ready'),
		check,
		...operations,
	}
}
