import { warn } from '@/locales/warn'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import type { FlowMapController, FlowMapPlugin } from '../../types/api/flowController.types'

function messageOf(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
}

function lastByName(plugins: readonly FlowMapPlugin[]): FlowMapPlugin[] {
	return plugins.filter((plugin, index) => {
		const isLast = !plugins.slice(index + 1).some(other => other.name === plugin.name)
		if (!isLast) warn(UI_FLOW_REVIEW.WARN_PLUGIN_DUPLICATE, { name: plugin.name })
		return isLast
	})
}

function runSetup(plugin: FlowMapPlugin, controller: FlowMapController): (() => void) | undefined {
	try {
		return plugin.setup?.(controller) || undefined
	} catch (error) {
		warn(UI_FLOW_REVIEW.WARN_PLUGIN_FAILED, { name: plugin.name, message: messageOf(error) })
		return undefined
	}
}

export function setupFlowPlugins(controller: FlowMapController, plugins: readonly FlowMapPlugin[]): () => void {
	const disposers = lastByName(plugins).flatMap(plugin => {
		const dispose = runSetup(plugin, controller)
		return dispose ? [{ plugin, dispose }] : []
	})
	let isDisposed = false
	return () => {
		if (isDisposed) return
		isDisposed = true
		for (const { plugin, dispose } of disposers.reverse()) {
			try {
				dispose()
			} catch (error) {
				warn(UI_FLOW_REVIEW.WARN_PLUGIN_FAILED, { name: plugin.name, message: messageOf(error) })
			}
		}
	}
}
