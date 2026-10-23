import type { CadesWindow } from '@composables/crypto/useCryptoPro/types/cadesplugin.types'
import { EMULATED_ERRORS } from '@composables/crypto/useCryptoPro/emulation/emulatedObjects'
import { emulatedCertificates } from '@composables/crypto/useCryptoPro/emulation/emulatedCertificates'
import { attribute, hashedData, record, signedData, signer, storeWithKeys } from './emulatedSignObjects'
import { createCryptoProEmulation } from '@composables/crypto/useCryptoPro/emulation/cryptoProEmulation'
import type { CadesSignObjectName, CadesSignObjects, CadesSignPlugin } from '../../types/cadesSign.types'
import type { CryptoProEmulation } from '@composables/crypto/useCryptoPro/types/cryptoProEmulation.types'
import type { EmulatedSignContext, CryptoProSignEmulationOptions } from '../../types/cryptoProSignEmulation.types'

const OWN: { [K in CadesSignObjectName]?: (context: EmulatedSignContext) => CadesSignObjects[K] } = {
	'CAdESCOM.CPSigner': context => signer(context),
	'CAdESCOM.CadesSignedData': signedData,
	'CAdESCOM.HashedData': hashedData,
	'CAdESCOM.CPAttribute': attribute,
}

async function createObject<K extends CadesSignObjectName>(context: EmulatedSignContext, name: K): Promise<CadesSignObjects[K]> {
	const factory = OWN[name]
	if (!factory) {
		const created = await context.base.CreateObjectAsync(name as 'CAdESCOM.Store' | 'CAdESCOM.About')
		return (
			name === 'CAdESCOM.Store' ? storeWithKeys(context, created as CadesSignObjects['CAdESCOM.Store']) : created
		) as CadesSignObjects[K]
	}
	record(context, 'cadesplugin.CreateObjectAsync', [name])
	if (context.options.scenario === 'noCsp') throw new Error(EMULATED_ERRORS.noCsp)
	return factory(context)
}

function installer(plugin: CadesSignPlugin): () => () => void {
	return () => {
		const target = window as unknown as { cadesplugin?: CadesSignPlugin } & Omit<CadesWindow, 'cadesplugin'>
		const previous = target.cadesplugin
		target.cadesplugin = plugin
		return () => {
			if (previous) target.cadesplugin = previous
			else delete target.cadesplugin
		}
	}
}

export function createCryptoProSignEmulation(options: CryptoProSignEmulationOptions = {}): CryptoProEmulation {
	const now = options.now ?? new Date()
	const base = createCryptoProEmulation({ ...options, now, delay: 0 })
	const context: EmulatedSignContext = {
		base: base.plugin,
		options,
		now,
		list: options.certificates ?? emulatedCertificates(now),
		calls: base.calls,
		signers: new WeakMap(),
		attributes: new WeakMap(),
		hashes: new WeakMap(),
	}
	const plugin: CadesSignPlugin = {
		then: (onFulfilled, onRejected) => base.plugin.then(onFulfilled, onRejected),
		CreateObjectAsync: name => createObject(context, name),
		getLastError: error => base.plugin.getLastError(error),
	}
	return { plugin: plugin as unknown as CryptoProEmulation['plugin'], calls: base.calls, install: installer(plugin) }
}
