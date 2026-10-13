/** Утилиты: загрузка `cadesplugin_api.js` по требованию, ожидание плагина с таймаутом и отметка ответа расширения */
import { CryptoProError } from '../errors'
import type { CadesPlugin, CadesWindow, CadesPluginHandle } from '../../types/cadesplugin.types'

const scripts = new Map<string, Promise<void>>()

function cadesWindow(): CadesWindow {
	return window as CadesWindow
}

function withTimeout<T>(promise: PromiseLike<T>, timeout: number, onTimeout: () => Error): Promise<T> {
	let timer: ReturnType<typeof setTimeout> | undefined
	const expired = new Promise<never>((_, reject) => {
		timer = setTimeout(() => reject(onTimeout()), timeout)
	})
	return Promise.race([promise, expired]).finally(() => clearTimeout(timer))
}

function appendScript(url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.src = url
		script.async = true
		script.addEventListener('load', () => resolve(), { once: true })
		script.addEventListener('error', () => reject(new CryptoProError('scriptFailed', url)), { once: true })
		document.head.append(script)
	})
}

function loadScript(url: string, timeout: number): Promise<void> {
	const loading = scripts.get(url) ?? withTimeout(appendScript(url), timeout, () => new CryptoProError('scriptFailed', url))
	scripts.set(url, loading)
	return loading.catch((error: unknown) => {
		scripts.delete(url)
		throw error
	})
}

/** `window.cadesplugin` в обёртке: уже на странице или после загрузки скрипта по `scriptUrl`; без обоих — ошибка `noScript` */
export async function obtainPlugin(scriptUrl: string | undefined, timeout: number): Promise<CadesPluginHandle> {
	const existing = cadesWindow().cadesplugin
	if (existing) return { plugin: existing }
	if (!scriptUrl) throw new CryptoProError('noScript')
	await loadScript(scriptUrl, timeout)
	const loaded = cadesWindow().cadesplugin
	if (!loaded) throw new CryptoProError('scriptFailed', scriptUrl)
	return { plugin: loaded }
}

/** Ждёт загрузки плагина: исполнение `cadesplugin` или ошибка по таймауту */
export function waitPlugin(plugin: CadesPlugin, timeout: number): Promise<void> {
	return withTimeout(plugin, timeout, () => new Error('timeout'))
}

/**
 * Следит за ответом расширения: `cadesplugin_api.js` вызывает `cadesplugin_extension_loaded_callback`, когда расширение загружено.
 * Ставится до загрузки скрипта, прежний обработчик тоже вызывается
 */
export function watchExtension(): { isLoaded: () => boolean; stop: () => void } {
	const target = cadesWindow()
	const previous = target.cadesplugin_extension_loaded_callback
	let isLoaded = false
	const callback = (): void => {
		isLoaded = true
		previous?.()
	}
	target.cadesplugin_extension_loaded_callback = callback
	return {
		isLoaded: () => isLoaded,
		stop: () => {
			if (target.cadesplugin_extension_loaded_callback === callback) target.cadesplugin_extension_loaded_callback = previous
		},
	}
}
