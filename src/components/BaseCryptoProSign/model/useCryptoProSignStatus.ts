import { formatMessage } from '@/locales/state'
import { UI_CRYPTOPRO } from '@/locales/messages'
import { computed, type DeepReadonly } from 'vue'
import type { CryptoProStatus, CryptoProStepId, CryptoProErrorCode } from '@composables/crypto/useCryptoPro'

const PLUGIN_URL = 'https://www.cryptopro.ru/products/cades/plugin'
const CSP_URL = 'https://www.cryptopro.ru/products/csp'

const STEP_LABELS: Record<CryptoProStepId, keyof typeof UI_CRYPTOPRO> = {
	extension: 'STEP_EXTENSION',
	plugin: 'STEP_PLUGIN',
	csp: 'STEP_CSP',
	objects: 'STEP_OBJECTS',
}

const STEP_ICONS = { pending: '', checking: '', ok: 'check-circle', error: 'x-circle' } as const

const STEP_STATES = { pending: 'STATE_PENDING', checking: 'STATE_CHECKING', ok: 'STATE_OK', error: 'STATE_ERROR' } as const

const PLUGIN_CODES: CryptoProErrorCode[] = ['noExtension', 'noPlugin', 'objectsFailed']

function helpFor(code: CryptoProErrorCode | undefined) {
	if (code === 'noCsp') return { text: UI_CRYPTOPRO.HELP_CSP, links: [{ href: CSP_URL, label: UI_CRYPTOPRO.LINK_CSP }] }
	if (code && PLUGIN_CODES.includes(code)) {
		return { text: UI_CRYPTOPRO.HELP_PLUGIN, links: [{ href: PLUGIN_URL, label: UI_CRYPTOPRO.LINK_PLUGIN }] }
	}
	return { text: UI_CRYPTOPRO.HELP_SCRIPT, links: [] }
}

export function useCryptoProSignStatus(status: DeepReadonly<CryptoProStatus>) {
	return {
		steps: computed(() =>
			status.steps.map(step => ({
				...step,
				label: UI_CRYPTOPRO[STEP_LABELS[step.id]],
				icon: STEP_ICONS[step.state],
				stateText: UI_CRYPTOPRO[STEP_STATES[step.state]],
			})),
		),
		statusHelp: computed(() => helpFor(status.error?.code)),
		versionsText: computed(() => formatMessage(UI_CRYPTOPRO.VERSIONS, { plugin: status.pluginVersion, csp: status.cspVersion })),
	}
}
