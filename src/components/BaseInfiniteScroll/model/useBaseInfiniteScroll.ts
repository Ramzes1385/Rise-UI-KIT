import { UI_TEXT } from '@/locales/messages'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type {
	BaseInfiniteScrollEmits,
	BaseInfiniteScrollExpose,
	BaseInfiniteScrollProps,
	InfiniteScrollResult,
	InfiniteScrollStatus,
} from '../types/BaseInfiniteScroll.types'

function statusMessage(status: InfiniteScrollStatus, props: BaseInfiniteScrollProps): string {
	switch (status) {
		case 'loading':
			return props.loadingText ?? UI_TEXT.LOADING
		case 'empty':
			return props.emptyText ?? UI_TEXT.NO_MORE_ITEMS
		case 'error':
			return props.errorText ?? UI_TEXT.LOAD_ERROR
		default:
			return ''
	}
}

function createObserver(
	props: BaseInfiniteScrollProps,
	sentinel: HTMLElement | null,
	onIntersect: () => void,
): IntersectionObserver | null {
	if (props.mode !== 'intersect' || !sentinel || typeof IntersectionObserver === 'undefined') return null
	const root = typeof props.root === 'string' ? document.querySelector(props.root) : (props.root ?? null)
	const observer = new IntersectionObserver(
		entries => {
			if (entries.some(entry => entry.isIntersecting)) onIntersect()
		},
		{ root, rootMargin: `0px 0px ${props.distance}px 0px` },
	)
	observer.observe(sentinel)
	return observer
}

function useLoading(emit: BaseInfiniteScrollEmits, onLoaded: () => void) {
	const status = ref<InfiniteScrollStatus>('idle')

	const load = (): void => {
		if (status.value === 'loading' || status.value === 'empty') return
		status.value = 'loading'
		let isDone = false
		emit('load', {
			done: (result: InfiniteScrollResult) => {
				if (isDone) return
				isDone = true
				status.value = result === 'ok' ? 'idle' : result
				if (result === 'ok') void nextTick(onLoaded)
			},
		})
	}

	return { status, load }
}

export function useBaseInfiniteScroll(props: BaseInfiniteScrollProps, emit: BaseInfiniteScrollEmits) {
	const standard = useStandardBaseComponent('base-infinite-scroll', props, ['root', 'status'])
	const sentinelRef = ref<HTMLElement | null>(null)
	let observer: IntersectionObserver | null = null

	const observe = (): void => {
		observer?.disconnect()
		observer = createObserver(props, sentinelRef.value, () => {
			if (status.value === 'idle') load()
		})
	}
	const { status, load } = useLoading(emit, observe)

	onMounted(observe)
	watch(() => [props.mode, props.root, props.distance], observe)
	onBeforeUnmount(() => observer?.disconnect())

	const reset = (): void => {
		status.value = 'idle'
		void nextTick(observe)
	}

	return {
		...standard,
		status,
		sentinelRef,
		message: computed(() => statusMessage(status.value, props)),
		isFooterEmpty: computed(() => status.value === 'idle' && props.mode === 'intersect'),
		load,
		exposed: { reset, load } satisfies BaseInfiniteScrollExpose,
	}
}
