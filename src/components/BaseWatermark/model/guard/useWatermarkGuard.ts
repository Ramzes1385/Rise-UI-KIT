import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted, onUpdated, watch } from 'vue'

const GUARDED_ATTRIBUTES = ['style', 'class', 'hidden', 'aria-hidden'] as const

function snapshotAttributes(layer: HTMLElement): Map<string, string | null> {
	return new Map(GUARDED_ATTRIBUTES.map(name => [name, layer.getAttribute(name)]))
}

function restoreAttributes(layer: HTMLElement, expected: Map<string, string | null>): void {
	for (const [name, value] of expected) {
		if (layer.getAttribute(name) === value) continue
		if (value === null) layer.removeAttribute(name)
		else layer.setAttribute(name, value)
	}
}

export function useWatermarkGuard(root: Ref<HTMLElement | null>, layer: Ref<HTMLElement | null>, isEnabled: () => boolean): void {
	let expected = new Map<string, string | null>()
	let observer: MutationObserver | null = null

	function repair(): void {
		const rootElement = root.value
		const layerElement = layer.value
		if (!rootElement || !layerElement) return
		if (layerElement.parentNode !== rootElement) rootElement.append(layerElement)
		restoreAttributes(layerElement, expected)
		observer?.takeRecords()
	}

	function stop(): void {
		observer?.disconnect()
		observer = null
	}

	function start(): void {
		stop()
		if (!isEnabled() || !root.value || !layer.value || typeof MutationObserver === 'undefined') return
		expected = snapshotAttributes(layer.value)
		observer = new MutationObserver(repair)
		observer.observe(root.value, { childList: true })
		observer.observe(layer.value, { attributes: true, attributeFilter: [...GUARDED_ATTRIBUTES] })
	}

	onMounted(start)
	onUpdated(() => {
		if (observer && layer.value) expected = snapshotAttributes(layer.value)
	})
	watch(isEnabled, start)
	onBeforeUnmount(stop)
}
