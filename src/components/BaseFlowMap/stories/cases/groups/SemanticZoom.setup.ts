import { ref } from 'vue'
import type { FlowMapController } from '@components/BaseFlowMap'

export function setup() {
	const map = ref<FlowMapController | null>(null)
	const status = ref('Уровень: 1 · Контекст')

	const refresh = () => {
		const level = map.value?.getLevel()
		const path = level?.path.length ? ` · вход: ${level.path.join(' › ')}` : ''
		status.value = `Уровень: ${(level?.index ?? 0) + 1} из ${level?.count} · ${level?.label}${path}`
	}
	const setLevel = (index: number) => {
		map.value?.setLevel(index, { isAnimated: false })
		refresh()
	}
	const enter = () => {
		map.value?.enterGroup('orders-svc', { isAnimated: false })
		refresh()
	}
	const leave = () => {
		map.value?.leaveGroup(0, { isAnimated: false })
		refresh()
	}

	return { map, status, setLevel, enter, leave }
}
