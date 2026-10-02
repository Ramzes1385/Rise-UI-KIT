/** Помощники тестов useCryptoPro: свой плагин поверх эмуляции, свои объекты хранилища и сертификатов, уборка `window` */
import { vi } from 'vitest'
import { setLocale } from '@/locales/state'
import type { CadesPlugin, CadesStore, CadesWindow, CadesObjects, CadesObjectName, CadesCertificate } from '../types/cadesplugin.types'

/** Фиксированное «сегодня» эмуляции */
export const NOW = new Date('2026-10-02T09:00:00.000Z')

export const IVANOV = 'A1B2C3D4E5F60718293A4B5C6D7E8F9012345678'
export const SIDOROVA = 'C3D4E5F60718293A4B5C6D7E8F90123456789012'
export const SMIRNOV = 'D4E5F60718293A4B5C6D7E8F9012345678901234'

type Overrides = { [K in CadesObjectName]?: (base: () => Promise<CadesObjects[K]>) => Promise<CadesObjects[K]> }

/**
 * Свой плагин: `then` и объекты — от `base`, кроме переопределённых. Плагин — thenable, поэтому его не возвращают
 * из async-функций и не передают в `resolve`
 */
export function customPlugin(
	base: CadesPlugin,
	options: { then?: CadesPlugin['then']; getLastError?: CadesPlugin['getLastError']; objects?: Overrides },
): CadesPlugin {
	const objects = { ...options.objects } as Record<string, ((create: () => Promise<unknown>) => Promise<unknown>) | undefined>
	return {
		then: options.then ?? ((onFulfilled, onRejected) => base.then(onFulfilled, onRejected)),
		CreateObjectAsync: (name => {
			const create = (): Promise<unknown> => base.CreateObjectAsync(name)
			const override = objects[name]
			return override ? override(create) : create()
		}) as CadesPlugin['CreateObjectAsync'],
		getLastError: options.getLastError ?? (error => base.getLastError(error)),
	}
}

/** Плагин, который не отвечает: `then` не исполняется никогда; `onCall` — что сделать при ожидании */
export function silentThen(onCall: () => void = () => undefined): CadesPlugin['then'] {
	return () => {
		onCall()
		return new Promise<never>(() => undefined)
	}
}

/** Сертификат с данными как есть — даты можно дать объектами `Date` (как в NPAPI) */
export function fakeCertificate(data: Partial<Record<keyof CadesCertificate, unknown>> & { subject?: string }): CadesCertificate {
	return {
		Thumbprint: Promise.resolve('ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00'),
		SubjectName: Promise.resolve(data.subject ?? 'CN=Тест'),
		IssuerName: Promise.resolve('CN=УЦ'),
		SerialNumber: Promise.resolve('01'),
		ValidFromDate: Promise.resolve(new Date('2026-01-01T00:00:00.000Z')),
		ValidToDate: Promise.resolve(new Date('2027-01-01T00:00:00.000Z')),
		HasPrivateKey: async () => true,
		IsValid: async () => ({ Result: Promise.resolve(true) }),
		...data,
	} as CadesCertificate
}

/** Хранилище из своих сертификатов; `close` — что делает `Close` */
export function fakeStore(list: CadesCertificate[], options: { close?: () => Promise<void>; certificates?: () => Promise<never> } = {}) {
	const closed = vi.fn(options.close ?? (async () => undefined))
	const collection = {
		Count: Promise.resolve(list.length),
		Item: async (index: number) => list[index - 1] as CadesCertificate,
		Find: async () => collection,
	}
	const store: CadesStore = {
		Open: async () => undefined,
		get Certificates() {
			return options.certificates ? options.certificates() : Promise.resolve(collection)
		},
		Close: closed,
	}
	return { store, closed }
}

export function install(plugin: CadesPlugin): void {
	;(window as CadesWindow).cadesplugin = plugin
}

export function stepStates(status: { readonly steps: readonly { readonly state: string }[] }): string[] {
	return status.steps.map(step => step.state)
}

/** Уборка после теста: плагин, колбэк расширения, скрипты, язык */
export function cleanup(): void {
	const target = window as CadesWindow
	delete target.cadesplugin
	delete target.cadesplugin_extension_loaded_callback
	for (const script of document.head.querySelectorAll('script')) script.remove()
	setLocale('ru')
}
