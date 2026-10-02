import { expect, vi } from 'vitest'
import BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'
import { render, screen, waitFor } from '@testing-library/vue'
import type { BaseCryptoProSignExpose } from '../types/BaseCryptoProSign.types'
import { createCryptoProSignEmulation } from '../model/emulation/cryptoProSignEmulation'
import type { CryptoProSignEmulationOptions } from '../types/cryptoProSignEmulation.types'
import type { CryptoProEmulation, CryptoProEmulationCall } from '@composables/crypto/useCryptoPro/types/cryptoProEmulation.types'

export const NOW = new Date('2026-03-10T09:00:00Z')

export const THUMBPRINTS = {
	ivanov: 'A1B2C3D4E5F60718293A4B5C6D7E8F9012345678',
	petrov: 'B2C3D4E5F60718293A4B5C6D7E8F901234567890',
	sidorova: 'C3D4E5F60718293A4B5C6D7E8F90123456789012',
	smirnov: 'D4E5F60718293A4B5C6D7E8F9012345678901234',
} as const

let restore: (() => void) | null = null

export function installEmulation(options: CryptoProSignEmulationOptions = {}): CryptoProEmulation {
	const emulation = createCryptoProSignEmulation({ now: NOW, ...options })
	restore = emulation.install()
	return emulation
}

export function restoreEmulation(): void {
	restore?.()
	restore = null
}

export function freezeDate(): void {
	vi.useFakeTimers({ toFake: ['Date'], now: NOW })
}

export function callsOf(emulation: CryptoProEmulation, member: string): CryptoProEmulationCall[] {
	return emulation.calls.filter(call => `${call.object}.${call.member}` === member)
}

export function textToBase64(text: string): string {
	return btoa(String.fromCharCode(...new TextEncoder().encode(text)))
}

type RenderOptions = Parameters<typeof render>[1]

export async function renderReady(options: RenderOptions = {}, emulationOptions: CryptoProSignEmulationOptions = {}) {
	const emulation = installEmulation(emulationOptions)
	const view = render(BaseCryptoProSign, options)
	await screen.findByText(/КриптоПро ЭЦП Browser plug-in 2\.0\.15400/)
	return { ...view, emulation }
}

export async function waitCertificates(): Promise<void> {
	await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent(/Иванов Иван Иванович|Петров Пётр Петрович/))
}

export function signButton(): HTMLElement {
	return screen.getByRole('button', { name: 'Подписать' })
}

export function lastEmitted<T>(emitted: Record<string, unknown[][]>, name: string): T {
	const list = emitted[name] as unknown[][]
	return (list[list.length - 1] as unknown[])[0] as T
}

export function renderExposed(props: Record<string, unknown> = {}, emulationOptions: CryptoProSignEmulationOptions = {}) {
	const emulation = installEmulation(emulationOptions)
	let exposed: BaseCryptoProSignExpose | null = null
	const view = render({
		components: { BaseCryptoProSign },
		setup: () => ({
			props,
			setRef: (value: unknown) => {
				exposed = value as BaseCryptoProSignExpose
			},
		}),
		template: '<BaseCryptoProSign :ref="setRef" v-bind="props" />',
	})
	return { ...view, emulation, api: () => exposed as unknown as BaseCryptoProSignExpose }
}

const BASE_OBJECTS = new Set(['CAdESCOM.About', 'CAdESCOM.Store'])

export function createdObjects(emulation: CryptoProEmulation, from: number): unknown[] {
	return callsOf({ ...emulation, calls: emulation.calls.slice(from) }, 'cadesplugin.CreateObjectAsync')
		.map(call => call.args[0])
		.filter(name => !BASE_OBJECTS.has(name as string))
}
