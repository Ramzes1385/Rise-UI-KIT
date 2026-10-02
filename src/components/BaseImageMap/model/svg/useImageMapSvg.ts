import { sanitizeSvg } from './sanitizeSvg'
import { ref, useId, watch, watchPostEffect } from 'vue'
import type { ImageMapLayer } from '../../types/imageMapData.types'
import type { SvgBinding, SvgOptions } from '../../types/imageMapInternal.types'

function useSvgMarkup(getLayer: () => ImageMapLayer | undefined, prefix: string) {
	const markup = ref('')
	const isLoading = ref(false)
	const hasError = ref(false)
	let request = 0

	async function load(url: string, token: number): Promise<void> {
		isLoading.value = true
		try {
			const response = await fetch(url)
			const text = response.ok ? await response.text() : ''
			if (token !== request) return
			markup.value = sanitizeSvg(text, prefix)
			hasError.value = !markup.value
		} catch {
			if (token === request) hasError.value = true
		} finally {
			if (token === request) isLoading.value = false
		}
	}

	watch(
		() => [getLayer()?.svg, getLayer()?.svgUrl],
		([svg, svgUrl]) => {
			request++
			hasError.value = false
			isLoading.value = false
			markup.value = svg ? sanitizeSvg(svg, prefix) : ''
			if (!svg && svgUrl) void load(svgUrl, request)
		},
		{ immediate: true },
	)

	return { markup, isLoading, hasError }
}

function applyAttributes(element: Element, binding: SvgBinding): void {
	for (const [name, value] of Object.entries(binding.attributes)) {
		if (value === undefined) element.removeAttribute(name)
		else element.setAttribute(name, value)
	}
	element.classList.add('base-image-map__object')
	for (const [name, isOn] of Object.entries(binding.classes)) element.classList.toggle(name, isOn)
	const style = (element as SVGElement).style
	for (const [name, value] of Object.entries(binding.item.style)) style.setProperty(name, value)
}

export function useImageMapSvg(options: SvgOptions) {
	const prefix = `rise-im-${useId()}-`
	const { markup, isLoading, hasError } = useSvgMarkup(options.getLayer, prefix)

	watchPostEffect(() => {
		const container = options.containerRef.value
		if (!container || !markup.value) return
		for (const binding of options.getBindings()) {
			const object = binding.item.object
			const element = object.type === 'svg' ? container.querySelector(`[id="${prefix}${object.elementId}"]`) : null
			if (element) applyAttributes(element, binding)
		}
	})

	return { markup, isLoading, hasError }
}
