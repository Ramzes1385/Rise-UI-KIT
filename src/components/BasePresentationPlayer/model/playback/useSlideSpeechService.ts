import { safeUrl } from './timeline'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { SlideSpeechCacheEntry, SlideSpeechServiceOptions, SlideSpeechTarget } from '../../types/PresentationModel.types'

const CACHE_SIZE = 8

const TIMEOUT_MS = 15_000

function useSpeechCache() {
	const entries = new Map<string, SlideSpeechCacheEntry>()
	const release = (entry: SlideSpeechCacheEntry): void => {
		entry.isCancelled = true
		entry.controller.abort()
		if (entry.isObjectUrl && entry.url) URL.revokeObjectURL(entry.url)
	}
	const remove = (key: string): void => {
		const entry = entries.get(key)
		if (!entry) return
		entries.delete(key)
		release(entry)
	}
	return {
		remove,
		peek: (key: string): SlideSpeechCacheEntry | undefined => entries.get(key),
		pending: (): SlideSpeechCacheEntry[] => [...entries.values()].filter(entry => !entry.url),
		use(key: string): SlideSpeechCacheEntry | undefined {
			const entry = entries.get(key)
			if (entry) {
				entries.delete(key)
				entries.set(key, entry)
			}
			return entry
		},
		add(entry: SlideSpeechCacheEntry): void {
			remove(entry.key)
			entries.set(entry.key, entry)
			while (entries.size > CACHE_SIZE) remove(entries.keys().next().value as string)
		},
		clear(): void {
			entries.forEach(release)
			entries.clear()
		},
	}
}

function useSpeechState() {
	const version = ref(0)
	const failed = ref<number[]>([])
	return {
		version,
		failed,
		bump: (): void => void (version.value += 1),
		markFailed(index: number): void {
			failed.value = [...new Set([...failed.value, index])]
		},
		clearFailed(index: number): void {
			failed.value = failed.value.filter(item => item !== index)
		},
	}
}

function toUrl(result: Blob | string): Pick<SlideSpeechCacheEntry, 'url' | 'isObjectUrl'> {
	if (typeof result === 'string') {
		const url = safeUrl(result)
		if (!url) throw new TypeError(`Unsafe speech audio URL: ${result}`)
		return { url, isObjectUrl: false }
	}
	return { url: URL.createObjectURL(result), isObjectUrl: true }
}

function createTarget(options: SlideSpeechServiceOptions, failed: () => number[]) {
	return (index: number): SlideSpeechTarget | undefined => {
		const slide = options.slides()[index]
		const provider = options.provider()
		if (!slide || !provider || options.isShared() || failed().includes(index)) return undefined
		if (safeUrl(slide.audio) || safeUrl(slide.video)) return undefined
		const text = slide.speech?.trim()
		return text ? { index, text, provider, key: [options.voice() ?? '', options.lang(), text].join('\u0000') } : undefined
	}
}

function useSpeechRequests(
	options: SlideSpeechServiceOptions,
	cache: ReturnType<typeof useSpeechCache>,
	state: ReturnType<typeof useSpeechState>,
) {
	const settle = (entry: SlideSpeechCacheEntry, result: Blob | string): void => {
		if (entry.isCancelled) return
		Object.assign(entry, toUrl(result))
		state.bump()
	}
	const fail = (entry: SlideSpeechCacheEntry, error: unknown): void => {
		if (entry.isCancelled) return
		cache.remove(entry.key)
		state.markFailed(entry.slide)
		state.bump()
		options.onError({ slide: entry.slide, error })
	}
	return {
		fail,
		start(target: SlideSpeechTarget): void {
			const controller = new AbortController()
			const entry: SlideSpeechCacheEntry = {
				key: target.key,
				slide: target.index,
				controller,
				isObjectUrl: false,
				isCancelled: false,
			}
			const request = { voice: options.voice(), lang: options.lang(), slide: target.index, signal: controller.signal }
			cache.add(entry)
			state.bump()
			const timer = setTimeout(() => fail(entry, new DOMException('Speech synthesis timed out', 'TimeoutError')), TIMEOUT_MS)
			Promise.resolve()
				.then(() => target.provider.synthesize(target.text, request))
				.then(result => settle(entry, result))
				.catch((error: unknown) => fail(entry, error))
				.finally(() => clearTimeout(timer))
		},
	}
}

function useSpeechSync(
	options: SlideSpeechServiceOptions,
	cache: ReturnType<typeof useSpeechCache>,
	parts: { target: ReturnType<typeof createTarget>; start: (target: SlideSpeechTarget) => void; bump: () => void },
) {
	const wanted = (): SlideSpeechTarget[] => {
		const current = options.index()
		const indexes = options.isPrefetching() ? [current, current + 1] : [current]
		const targets = indexes.map(parts.target).filter((target): target is SlideSpeechTarget => target !== undefined)
		return targets.filter((target, position) => targets.findIndex(other => other.key === target.key) === position)
	}
	return (): void => {
		const targets = wanted()
		const stale = cache.pending().filter(entry => !targets.some(target => target.key === entry.key))
		stale.forEach(entry => cache.remove(entry.key))
		if (stale.length) parts.bump()
		targets.forEach(target => {
			if (!cache.use(target.key)) parts.start(target)
		})
	}
}

function watchSpeechInputs(
	options: SlideSpeechServiceOptions,
	parts: { cache: ReturnType<typeof useSpeechCache>; state: ReturnType<typeof useSpeechState>; run: () => void },
): void {
	const { cache, state } = parts
	watch(
		() => [options.provider(), options.voice()],
		() => {
			cache.clear()
			state.bump()
		},
		{ flush: 'sync' },
	)
	watch(options.index, (_, previous) => state.clearFailed(previous))
	watch(
		() => [
			options.index(),
			options.provider(),
			options.voice(),
			options.lang(),
			options.isPrefetching(),
			options.slides(),
			options.isShared(),
		],
		parts.run,
	)
	onBeforeUnmount(cache.clear)
}

export function useSlideSpeechService(options: SlideSpeechServiceOptions) {
	const cache = useSpeechCache()
	const state = useSpeechState()
	const target = createTarget(options, () => state.failed.value)
	const { start, fail } = useSpeechRequests(options, cache, state)
	const sync = useSpeechSync(options, cache, { target, start, bump: state.bump })
	const isMounted = ref(false)
	const run = (): void => {
		if (isMounted.value) sync()
	}
	const wanted = computed(() => target(options.index()))
	const current = computed(() => {
		void state.version.value
		const entry = wanted.value ? cache.peek(wanted.value.key) : undefined
		return { entry, url: entry?.url }
	})
	watchSpeechInputs(options, { cache, state, run })
	onMounted(() => {
		isMounted.value = true
		run()
	})

	return {
		audioSrc: computed(() => current.value.url),
		isPending: computed(() => wanted.value !== undefined && !current.value.url),
		isFallback: computed(() => state.failed.value.includes(options.index())),
		failMedia(error: unknown): void {
			const { entry } = current.value
			if (!entry?.url) return
			entry.slide = options.index()
			fail(entry, error)
		},
	}
}
