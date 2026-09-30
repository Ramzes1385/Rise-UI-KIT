/** Утилиты: загрузка внешнего скрипта по требованию — один тег на адрес, повторный вызов ждёт ту же загрузку */
import type { CallbackWindow, LoadScriptOptions } from './types/scriptUtils.types'

const loading = new Map<string, Promise<void>>()

function appendScript(src: string, options: LoadScriptOptions): Promise<void> {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		const target = window as unknown as CallbackWindow
		for (const [name, value] of Object.entries(options.attributes ?? {})) script.setAttribute(name, value)
		script.src = src
		script.async = true
		script.onerror = () => {
			script.remove()
			loading.delete(src)
			reject(new Error(`Script: ${src}`))
		}
		if (options.callbackName) target[options.callbackName] = () => resolve()
		else script.onload = () => resolve()
		document.head.append(script)
	})
}

export function loadScript(src: string, options: LoadScriptOptions = {}): Promise<void> {
	const pending = loading.get(src) ?? appendScript(src, options)
	loading.set(src, pending)
	return pending
}

export function forgetScript(src: string): void {
	loading.delete(src)
	for (const script of document.querySelectorAll('script')) if (script.src === src) script.remove()
}
