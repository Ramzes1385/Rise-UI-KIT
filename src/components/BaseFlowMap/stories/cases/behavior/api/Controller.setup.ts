import { ref } from 'vue'
import type { FlowMapController } from '@components/BaseFlowMap'

export function setup() {
	const map = ref<FlowMapController | null>(null)
	const result = ref('Выберите действие')

	const fit = () => map.value?.fitView({ isAnimated: true })
	const showKafka = () => map.value?.focus('kafka', { isZoomed: true, isAnimated: true })
	const select = () => {
		map.value?.select(['orders', 'pay'])
		result.value = `Выделено: ${map.value?.getSelection().join(', ')}`
	}
	const highlight = () => {
		const edges = map.value?.highlightPath({ from: 'web', to: 'kafka' }) ?? []
		result.value = `Путь Web → Kafka: ${edges.join(', ')}`
	}
	const clear = () => {
		map.value?.clearHighlight()
		map.value?.select([])
		result.value = 'Подсветка и выделение сняты'
	}
	const addNode = async () => {
		const outcome = await map.value?.addNode({ id: 'search', kind: 'service', label: 'Search', subtitle: 'Elastic', group: 'services' })
		result.value = outcome?.isApplied ? 'Добавлен узел Search' : 'Узел не добавлен'
	}
	const undo = () => {
		map.value?.undo()
		result.value = 'Отменено последнее действие'
	}
	const exportJson = () => {
		result.value = `Выгружено ${map.value?.exportJson().length} символов JSON`
	}

	return { map, result, fit, showKafka, select, highlight, clear, addNode, undo, exportJson }
}
