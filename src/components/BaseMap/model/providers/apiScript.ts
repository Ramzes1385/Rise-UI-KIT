import { warn } from '@/locales/warn'
import { UI_WARNINGS } from '@/locales/messages'
import type { ProviderApiLoad, ProviderApiRequest } from '../../types/providers.types'

const loads = new Map<string, ProviderApiLoad>()

const loadKey = (provider: string, apiKey: string): string => `${provider}\u0000${apiKey}`

function warnOnce(entry: ProviderApiLoad, provider: string, requested: string): void {
	if (entry.warned.has(requested)) return
	entry.warned.add(requested)
	warn(UI_WARNINGS.MAP_LANGUAGE_FIXED, { provider, current: entry.language, requested })
}

function startLoad(key: string, language: string, load: (language: string) => Promise<void>): ProviderApiLoad {
	const entry: ProviderApiLoad = { language, pending: null, warned: new Set() }
	entry.pending = load(language).then(
		() => {
			entry.pending = null
		},
		(error: unknown) => {
			loads.delete(key)
			throw error
		},
	)
	loads.set(key, entry)
	return entry
}

export async function loadProviderApi({ provider, apiKey, language, isLoaded, load }: ProviderApiRequest): Promise<void> {
	const key = loadKey(provider, apiKey)
	const current = loads.get(key)
	if (current && current.language !== language) warnOnce(current, provider, language)
	if (isLoaded() && !current?.pending) return
	const entry = current ?? startLoad(key, language, load)
	if (entry.pending) await entry.pending
}

export function forgetProviderApi(provider: string, apiKey: string): void {
	loads.delete(loadKey(provider, apiKey))
}
