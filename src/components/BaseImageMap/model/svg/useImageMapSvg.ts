import { sanitizeSvg } from './sanitizeSvg'
import type { ImageMapLayer } from '../../types/imageMapData.types'
import { ref, useId, watch, onMounted, watchPostEffect } from 'vue'
import type { SvgBinding, SvgOptions } from '../../types/internal/imageMapInternal.types'

export function attributeSelector(name: string, value: string): string {
	return `[${name}="${value.replace(/["\\]/g, '\\$&').replace(/\n/g, '\\a ')}"]`
}

export function useSvgMarkup(getLayer: () => ImageMapLayer | undefined, prefix: string) {
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

	onMounted(() =>
		watch(
			() => [getLayer()?.svg, getLayer()?.svgUrl],
			([svg, svgUrl]) => {
				request++
				isLoading.value = false
				markup.value = svg ? sanitizeSvg(svg, prefix) : ''
				hasError.value = Boolean(svg) && !markup.value
				if (!svg && svgUrl) void load(svgUrl, request)
			},
			{ immediate: true },
		),
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

function findElement(container: HTMLElement, prefix: string, binding: SvgBinding): Element | null {
	return container.querySelector(attributeSelector('id', prefix + binding.elementId))
}

function isSameSet(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
	return left.size === right.size && [...left].every(id => right.has(id))
}

export function useImageMapSvg(options: SvgOptions) {
	const prefix = `rise-im-${useId()}-`
	const { markup, isLoading, hasError } = useSvgMarkup(options.getLayer, prefix)

	watchPostEffect(() => {
		const container = options.containerRef.value
		const bindings = container && markup.value ? options.getBindings() : []
		const rendered = new Set(
			bindings.filter(binding => findElement(container as HTMLElement, prefix, binding)).map(binding => binding.item.object.id),
		)
		if (!isSameSet(rendered, options.renderedIds.value)) options.renderedIds.value = rendered
	})

	watchPostEffect(() => {
		const container = options.containerRef.value
		if (!container || !markup.value) return
		for (const binding of options.getBindings()) {
			const element = findElement(container, prefix, binding)
			if (element) applyAttributes(element, binding)
		}
	})

	return { markup, isLoading, hasError }
}
