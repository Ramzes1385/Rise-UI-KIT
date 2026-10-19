import { computed, ref } from 'vue'
import { defineFlowPlugin } from '@components/BaseFlowMap'

export function setup() {
	const log = ref<string[]>([])
	const isOn = ref(true)
	const push = (line: string) => {
		log.value = [line, ...log.value].slice(0, 6)
	}

	const audit = defineFlowPlugin({
		name: 'audit',
		validators: [
			data =>
				data.nodes
					.filter(node => !node.owner)
					.map(node => ({
						level: 'warning' as const,
						code: 'audit-owner',
						message: `У «${node.label}» нет владельца`,
						target: { entity: 'node' as const, id: node.id },
					})),
		],
		setup: controller => {
			push('audit: подключён')
			const off = controller.on('node-click', event => push(`audit: клик по ${event.target.id}`))
			return () => {
				off()
				push('audit: отключён')
			}
		},
	})

	const plugins = computed(() => (isOn.value ? [audit] : []))
	const toggle = () => {
		isOn.value = !isOn.value
	}

	return { log, isOn, plugins, toggle }
}
