import { MAIN_MAP } from './services'
import type { FlowMapData } from '../../types/data/flowData.types'

export const LEGEND_MAP: FlowMapData = {
	...MAIN_MAP,
	statuses: [{ id: 'maintenance', label: 'Обслуживание', icon: 'info', color: 'var(--rise-info)' }],
	nodes: MAIN_MAP.nodes.map(node => (node.id === 'kafka' ? { ...node, status: 'maintenance' } : node)),
}
