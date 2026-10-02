/** Утилиты: эмуляция КриптоПро ЭЦП Browser plug-in для тестов, историй и демо приложения — сертификаты, фиктивная подпись, сценарии ошибок */
import { emulatedCertificates } from './emulatedCertificates'
import { EMULATED_ERRORS, createEmulatedObject } from './emulatedObjects'
import type { CadesPlugin, CadesWindow } from '../types/cadesplugin.types'
import type { EmulationContext, CryptoProEmulation, CryptoProEmulationOptions } from '../types/cryptoProEmulation.types'

function loadFailure(context: EmulationContext): Error | null {
	if (context.scenario === 'noExtension') return new Error(EMULATED_ERRORS.noExtension)
	return context.scenario === 'noPlugin' ? new Error(EMULATED_ERRORS.noPlugin) : null
}

function createPlugin(context: EmulationContext): CadesPlugin {
	return {
		then(onFulfilled, onRejected) {
			if (context.scenario !== 'noExtension') (window as CadesWindow).cadesplugin_extension_loaded_callback?.()
			const failure = loadFailure(context)
			return (failure ? Promise.reject(failure) : Promise.resolve()).then(onFulfilled, onRejected)
		},
		CreateObjectAsync: name => createEmulatedObject(context, name),
		getLastError: error => (error instanceof Error ? error.message : String(error)),
	}
}

/**
 * Эмуляция плагина: `install()` ставит `window.cadesplugin`, и `useCryptoPro` работает без расширения, плагина и CSP.
 * Подпись фиктивная (Base64 строки `RISE-EMULATED-CADES-BES;…`), проверить её нельзя. `calls` — журнал вызовов объектов плагина
 */
export function createCryptoProEmulation(options: CryptoProEmulationOptions = {}): CryptoProEmulation {
	const now = options.now ?? new Date()
	const context: EmulationContext = {
		scenario: options.scenario ?? 'ready',
		now,
		delay: options.delay ?? 0,
		pluginVersion: options.pluginVersion ?? '2.0.15400',
		cspVersion: options.cspVersion ?? '5.0.12000',
		list: options.certificates ?? emulatedCertificates(now),
		calls: [],
		certificates: new WeakMap(),
		signers: new WeakMap(),
	}
	const plugin = createPlugin(context)
	return {
		plugin,
		calls: context.calls,
		install() {
			const target = window as CadesWindow
			const previous = target.cadesplugin
			target.cadesplugin = plugin
			return () => {
				if (previous) target.cadesplugin = previous
				else delete target.cadesplugin
			}
		},
	}
}
