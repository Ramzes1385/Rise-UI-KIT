import { ref } from 'vue'
import type { FlowConnectContext, FlowDeleteContext, FlowNode } from '@components/BaseFlowMap'

interface Request {
	label: string
	answer: (isApproved: boolean) => void
}

export function setup() {
	const request = ref<Request | null>(null)

	const guardDelete = (context: FlowDeleteContext): boolean | void => {
		if (context.nodes.some((node: FlowNode) => node.label === 'Банк')) return false
	}

	const approveConnect = (context: FlowConnectContext): Promise<boolean> =>
		new Promise(resolve => {
			request.value = {
				label: `${context.source.label} → ${context.target.label}`,
				answer: isApproved => {
					request.value = null
					resolve(isApproved)
				},
			}
		})

	const answer = (isApproved: boolean) => request.value?.answer(isApproved)

	return { request, guardDelete, approveConnect, answer }
}
