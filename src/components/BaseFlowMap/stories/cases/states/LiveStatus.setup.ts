import { ref } from 'vue'
import type { FlowLiveState } from '@components/BaseFlowMap'

export function setup() {
	const live = ref<FlowLiveState>({})

	const degrade = () => {
		live.value = {
			nodes: {
				pay: { status: 'error', metrics: [{ id: 'p95', label: 'p95', value: 2400, unit: 'мс', status: 'error', trend: 'up' }] },
				bank: { status: 'down' },
			},
			edges: { e6: { status: 'warning' }, e7: { status: 'error', traffic: { rate: 0 } } },
		}
	}
	const peak = () => {
		live.value = {
			nodes: { gw: { metrics: [{ id: 'rps', label: 'Запросов/с', value: 3200, trend: 'up' }], badge: '×2' } },
			edges: { e1: { traffic: { rate: 3 } }, e2: { traffic: { rate: 3 } } },
		}
	}
	const recover = () => {
		live.value = { nodes: { pay: { status: 'ok' }, bank: { status: 'ok' } }, edges: { e6: { status: 'ok' }, e7: { status: 'ok' } } }
	}

	return { live, degrade, peak, recover }
}
