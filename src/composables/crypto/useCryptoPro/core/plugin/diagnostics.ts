/** Утилиты: диагностика КриптоПро по шагам демостраницы — расширение, плагин, КриптоПро CSP, объекты подписи */
import { CADES } from '../constants'
import { CryptoProError, toCryptoProError } from '../errors'
import { obtainPlugin, waitPlugin, watchExtension } from './loader'
import type { CadesPlugin, CadesAbout, CadesPluginHandle } from '../../types/cadesplugin.types'
import type {
	CryptoProStatus,
	CryptoProStepId,
	CryptoProStepState,
	CryptoProErrorCode,
	DiagnosticsContext,
} from '../../types/useCryptoPro.types'

function mark(status: CryptoProStatus, id: CryptoProStepId, state: CryptoProStepState): void {
	const step = status.steps.find(item => item.id === id)
	if (step) step.state = state
}

async function runStep<T>(
	context: DiagnosticsContext,
	step: { id: CryptoProStepId; code: CryptoProErrorCode; plugin?: CadesPlugin },
	action: () => Promise<T>,
): Promise<T> {
	mark(context.status, step.id, 'checking')
	try {
		const result = await action()
		mark(context.status, step.id, 'ok')
		return result
	} catch (error) {
		mark(context.status, step.id, 'error')
		throw toCryptoProError(error, step.plugin, step.code)
	}
}

async function versionText(version: PromiseLike<{ toString(): Promise<string> | string }>): Promise<string> {
	return String(await (await version).toString())
}

async function loadPlugin(context: DiagnosticsContext): Promise<CadesPluginHandle> {
	const extension = watchExtension()
	mark(context.status, 'extension', 'checking')
	try {
		const handle = await obtainPlugin(context.scriptUrl, context.timeout)
		await waitPlugin(handle.plugin, context.timeout).catch((error: unknown) => {
			throw toCryptoProError(error, undefined, extension.isLoaded() ? 'noPlugin' : 'noExtension')
		})
		mark(context.status, 'extension', 'ok')
		return handle
	} catch (error) {
		const isPluginFailure = error instanceof CryptoProError && error.code === 'noPlugin'
		mark(context.status, 'extension', isPluginFailure ? 'ok' : 'error')
		if (isPluginFailure) mark(context.status, 'plugin', 'error')
		throw error
	} finally {
		extension.stop()
	}
}

async function readCsp(context: DiagnosticsContext, plugin: CadesPlugin, about: CadesAbout): Promise<void> {
	await runStep(context, { id: 'csp', code: 'noCsp', plugin }, async () => {
		context.status.cspVersion = await versionText(about.CSPVersion('', CADES.PROVIDER_GOST_2012))
		context.status.cspName = await about.CSPName(CADES.PROVIDER_GOST_2012)
	})
}

/** Проходит шаги по порядку и обновляет `status`; первый неудачный шаг — ошибка `CryptoProError`, следующие остаются `pending` */
export async function runDiagnostics(context: DiagnosticsContext): Promise<CadesPluginHandle> {
	const handle = await loadPlugin(context)
	const { plugin } = handle
	const about = await runStep(context, { id: 'plugin', code: 'noPlugin', plugin }, async () => {
		const created = await plugin.CreateObjectAsync('CAdESCOM.About')
		context.status.pluginVersion = await versionText(created.PluginVersion)
		return created
	})
	await readCsp(context, plugin, about)
	await runStep(context, { id: 'objects', code: 'objectsFailed', plugin }, async () => {
		await plugin.CreateObjectAsync('CAdESCOM.CPSigner')
		await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
	})
	return handle
}
