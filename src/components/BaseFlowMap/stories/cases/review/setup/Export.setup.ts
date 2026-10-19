import { ref } from 'vue'
import type { FlowMapController } from '@components/BaseFlowMap'

export function setup() {
	const map = ref<FlowMapController | null>(null)
	const result = ref('Выберите формат')

	const exportSvg = async () => {
		const svg = (await map.value?.exportSvg({ area: 'content', background: 'theme' })) ?? ''
		result.value = `SVG: ${svg.length} символов, начинается с ${svg.slice(0, 4)}`
	}
	const exportPng = async () => {
		const blob = await map.value?.exportPng({ area: 'content', pixelRatio: 1 })
		result.value = `PNG: ${blob?.type}, ${blob ? Math.max(1, Math.round(blob.size / 1024)) : 0} КБ`
	}
	const exportJson = () => {
		result.value = `JSON: ${map.value?.exportJson().length} символов`
	}

	return { map, result, exportSvg, exportPng, exportJson }
}
