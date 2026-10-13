import type { Ref } from 'vue'
import { buildImageTile } from './watermarkImage'
import { measureLines } from './watermarkMeasure'
import { computed, onMounted, shallowRef, watch } from 'vue'
import { buildTextTile, normalizeLines } from './watermarkPattern'
import type { WatermarkFont, WatermarkProps, WatermarkTile } from '../../types/BaseWatermark.types'

const FALLBACK_FONT = 'sans-serif'

function buildText(props: WatermarkProps, host: HTMLElement | null): WatermarkTile | null {
	const lines = normalizeLines(props.content)
	if (lines.length === 0) return null
	const font: WatermarkFont = { size: props.fontSize, family: (host && getComputedStyle(host).fontFamily) || FALLBACK_FONT }
	return buildTextTile({
		lines,
		textWidth: measureLines(host, lines, font),
		font,
		color: props.textColor,
		rotate: props.rotate,
		gap: props.gap,
	})
}

export function useWatermarkTile(props: WatermarkProps, root: Ref<HTMLElement | null>) {
	const tile = shallowRef<WatermarkTile | null>(null)
	const settingsKey = computed((): string =>
		JSON.stringify([props.content, props.image, props.width, props.height, props.rotate, props.gap, props.fontSize, props.textColor]),
	)
	let version = 0

	async function rebuild(): Promise<void> {
		const current = ++version
		const next = props.image
			? await buildImageTile({ image: props.image, width: props.width, height: props.height, rotate: props.rotate, gap: props.gap })
			: buildText(props, root.value)
		if (current === version) tile.value = next
	}

	onMounted(rebuild)
	watch(settingsKey, rebuild)

	return { tile }
}
