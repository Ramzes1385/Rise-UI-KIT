import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import type { FlowCommand } from '../../types/internal/flowModel.types'
import type { FlowEventBus } from '../../types/internal/core/flowModelCore.types'
import type { FlowCommandResult, FlowRejectEvent } from '../../types/api/flowController.types'

const HOOK_BY_COMMAND: Record<string, string> = {
	'add-node': 'beforeCreate',
	'add-group': 'beforeCreate',
	connect: 'beforeConnect',
	delete: 'beforeDelete',
	'update-label': 'beforeEditLabel',
	'accept-proposal': 'beforeAccept',
}

export function hookNameOf(command: FlowCommand): string {
	return HOOK_BY_COMMAND[command.name] ?? 'beforeChange'
}

export function hookReject(command: FlowCommand, hook: string): FlowRejectEvent {
	return { command: command.name, by: 'hook', message: formatMessage(UI_FLOW_MAP.REJECT_HOOK, { hook }), code: hook }
}

export function limitReject(command: FlowCommand, message: string, code: string): FlowRejectEvent {
	return { command: command.name, by: 'limit', message, code }
}

export function refuse(events: FlowEventBus, reject: FlowRejectEvent): FlowCommandResult {
	events.emit('reject', reject)
	if (reject.by === 'hook' && reject.code) events.note(reject.code, reject.message ?? '')
	return { isApplied: false, changes: [], reject }
}
