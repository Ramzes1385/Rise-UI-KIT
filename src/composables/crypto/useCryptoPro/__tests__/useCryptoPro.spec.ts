import { CryptoProError, useCryptoPro } from '..'
import { runDiagnostics } from '../core/diagnostics'
import { renderToString } from 'vue/server-renderer'
import { mount, flushPromises } from '@vue/test-utils'
import { createCryptoProEmulation } from '../emulation'
import { createSSRApp, defineComponent, h, ref } from 'vue'
import type { CadesWindow } from '../types/cadesplugin.types'
import type { CryptoProStatus } from '../types/useCryptoPro.types'
import { NOW, install, cleanup, stepStates, silentThen, customPlugin } from './cryptoProFakes'

const callbackWindow = window as CadesWindow

function aboutCalls(calls: { object: string; member: string; args: unknown[] }[]): number {
	return calls.filter(call => call.member === 'CreateObjectAsync' && call.args[0] === 'CAdESCOM.About').length
}

function scriptsOf(url: string): HTMLScriptElement[] {
	return [...document.head.querySelectorAll<HTMLScriptElement>(`script[src="${url}"]`)]
}

/** Код плагина грузится динамически — скрипт появляется в head не сразу после `check()` */
async function appendedScripts(url: string, count = 1): Promise<HTMLScriptElement[]> {
	await vi.waitFor(() => expect(scriptsOf(url)).toHaveLength(count))
	return scriptsOf(url)
}

afterEach(cleanup)

describe('useCryptoPro — диагностика', () => {
	it('до проверки — idle, все шаги pending', () => {
		const { status, isReady } = useCryptoPro()
		expect(status.state).toBe('idle')
		expect(stepStates(status)).toEqual(['pending', 'pending', 'pending', 'pending'])
		expect(status.steps.map(step => step.id)).toEqual(['extension', 'plugin', 'csp', 'objects'])
		expect(isReady.value).toBe(false)
	})

	it('ready — все шаги ok, версии плагина и CSP', async () => {
		const emulation = createCryptoProEmulation({ now: NOW })
		emulation.install()
		const { status, isReady, check } = useCryptoPro()
		const checking = check()
		expect(status.state).toBe('checking')
		await expect(checking).resolves.toBe(true)
		expect(status.state).toBe('ready')
		expect(isReady.value).toBe(true)
		expect(stepStates(status)).toEqual(['ok', 'ok', 'ok', 'ok'])
		expect(status.pluginVersion).toBe('2.0.15400')
		expect(status.cspVersion).toBe('5.0.12000')
		expect(status.cspName).toBe('Crypto-Pro GOST R 34.10-2012 Cryptographic Service Provider')
		expect(status.error).toBeNull()
		expect(emulation.calls).toContainEqual({ object: 'About', member: 'CSPVersion', args: ['', 80] })
	})

	it('свои версии эмуляции', async () => {
		createCryptoProEmulation({ pluginVersion: '2.0.1', cspVersion: '4.0.9' }).install()
		const { status, check } = useCryptoPro()
		await check()
		expect(status.pluginVersion).toBe('2.0.1')
		expect(status.cspVersion).toBe('4.0.9')
	})

	it('параллельные проверки делят одну, следующая — новая', async () => {
		const emulation = createCryptoProEmulation()
		emulation.install()
		const { check } = useCryptoPro()
		await expect(Promise.all([check(), check()])).resolves.toEqual([true, true])
		expect(aboutCalls(emulation.calls)).toBe(1)
		await check()
		expect(aboutCalls(emulation.calls)).toBe(2)
	})

	it.each([
		['noExtension', ['error', 'pending', 'pending', 'pending']],
		['noPlugin', ['ok', 'error', 'pending', 'pending']],
		['noCsp', ['ok', 'ok', 'error', 'pending']],
	] as const)('%s — шаги %j, код ошибки', async (scenario, steps) => {
		createCryptoProEmulation({ scenario }).install()
		const { status, isReady, check } = useCryptoPro()
		await expect(check()).resolves.toBe(false)
		expect(status.state).toBe('error')
		expect(isReady.value).toBe(false)
		expect(stepStates(status)).toEqual(steps)
		expect(status.error).toBeInstanceOf(CryptoProError)
		expect(status.error?.code).toBe(scenario)
	})

	it('noCsp — текст плагина с кодом в detail', async () => {
		createCryptoProEmulation({ scenario: 'noCsp' }).install()
		const { status, check } = useCryptoPro()
		await check()
		expect(status.error?.detail).toContain('(0x80070002)')
		expect(status.error?.message).toBe('Не установлен криптопровайдер КриптоПро CSP')
	})

	it('повторная проверка сбрасывает прежнюю ошибку', async () => {
		createCryptoProEmulation({ scenario: 'noPlugin' }).install()
		const { status, check } = useCryptoPro()
		await check()
		createCryptoProEmulation().install()
		await expect(check()).resolves.toBe(true)
		expect(status.error).toBeNull()
		expect(stepStates(status)).toEqual(['ok', 'ok', 'ok', 'ok'])
	})

	it('таймаут без ответа расширения — noExtension', async () => {
		install(customPlugin(createCryptoProEmulation().plugin, { then: silentThen() }))
		const { status, check } = useCryptoPro({ timeout: 10 })
		await expect(check()).resolves.toBe(false)
		expect(status.error?.code).toBe('noExtension')
		expect(stepStates(status)).toEqual(['error', 'pending', 'pending', 'pending'])
	})

	it('таймаут после ответа расширения — noPlugin', async () => {
		const answer = (): void => callbackWindow.cadesplugin_extension_loaded_callback?.()
		install(customPlugin(createCryptoProEmulation().plugin, { then: silentThen(answer) }))
		const { status, check } = useCryptoPro({ timeout: 10 })
		await check()
		expect(status.error?.code).toBe('noPlugin')
		expect(stepStates(status)).toEqual(['ok', 'error', 'pending', 'pending'])
	})

	it('About не создаётся — noPlugin на шаге плагина', async () => {
		const base = createCryptoProEmulation().plugin
		install(customPlugin(base, { objects: { 'CAdESCOM.About': () => Promise.reject(new Error('Нет объекта')) } }))
		const { status, check } = useCryptoPro()
		await check()
		expect(status.error?.code).toBe('noPlugin')
		expect(status.error?.detail).toBe('Нет объекта')
		expect(stepStates(status)).toEqual(['ok', 'error', 'pending', 'pending'])
	})

	it('версия строкой без обещания тоже читается', async () => {
		const version = { toString: () => '2.0.7' }
		const about = { PluginVersion: Promise.resolve(version), CSPVersion: async () => version, CSPName: async () => 'CSP' }
		install(customPlugin(createCryptoProEmulation().plugin, { objects: { 'CAdESCOM.About': async () => about } }))
		const { status, check } = useCryptoPro()
		await check()
		expect(status.pluginVersion).toBe('2.0.7')
		expect(status.cspVersion).toBe('2.0.7')
		expect(status.cspName).toBe('CSP')
	})

	it('объекты подписи не создаются — objectsFailed', async () => {
		const base = createCryptoProEmulation().plugin
		install(customPlugin(base, { objects: { 'CAdESCOM.CPSigner': () => Promise.reject(new Error('Сбой CPSigner')) } }))
		const { status, check } = useCryptoPro()
		await check()
		expect(status.error?.code).toBe('objectsFailed')
		expect(stepStates(status)).toEqual(['ok', 'ok', 'ok', 'error'])
	})

	it('прежний колбэк расширения приложения вызывается и восстанавливается', async () => {
		const previous = vi.fn()
		callbackWindow.cadesplugin_extension_loaded_callback = previous
		createCryptoProEmulation().install()
		await useCryptoPro().check()
		expect(previous).toHaveBeenCalledTimes(1)
		expect(callbackWindow.cadesplugin_extension_loaded_callback).toBe(previous)
	})

	it('колбэк, заменённый во время проверки, не затирается', async () => {
		const replaced = vi.fn()
		const base = createCryptoProEmulation().plugin
		const then = (...args: Parameters<typeof base.then>) => {
			callbackWindow.cadesplugin_extension_loaded_callback = replaced
			return base.then(...args)
		}
		install(customPlugin(base, { then: then as typeof base.then }))
		await useCryptoPro().check()
		expect(callbackWindow.cadesplugin_extension_loaded_callback).toBe(replaced)
	})

	it('runDiagnostics пропускает отметку шага, которого нет в status', async () => {
		createCryptoProEmulation().install()
		const status: CryptoProStatus = { state: 'checking', steps: [], pluginVersion: '', cspVersion: '', cspName: '', error: null }
		const handle = await runDiagnostics({ scriptUrl: undefined, timeout: 1000, status })
		expect(handle.plugin).toBe(callbackWindow.cadesplugin)
		expect(status.steps).toEqual([])
		expect(status.pluginVersion).toBe('2.0.15400')
	})
})

describe('useCryptoPro — загрузка скрипта', () => {
	it('без cadesplugin и scriptUrl — noScript, скрипт не добавляется', async () => {
		const { status, check } = useCryptoPro()
		await expect(check()).resolves.toBe(false)
		expect(status.error?.code).toBe('noScript')
		expect(status.error?.message).toBe('Не подключён скрипт cadesplugin_api.js')
		expect(stepStates(status)).toEqual(['error', 'pending', 'pending', 'pending'])
		expect(document.head.querySelector('script')).toBeNull()
	})

	it('cadesplugin уже есть — скрипт не грузится', async () => {
		createCryptoProEmulation().install()
		await expect(useCryptoPro({ scriptUrl: '/unused.js' }).check()).resolves.toBe(true)
		expect(document.head.querySelector('script')).toBeNull()
	})

	it('scriptUrl — async-скрипт в head, после load — проверка плагина; один скрипт на адрес', async () => {
		const url = 'https://cdn.example.ru/cades-load.js'
		const { status, check } = useCryptoPro({ scriptUrl: () => url })
		const checking = check()
		const [script] = await appendedScripts(url)
		expect(script?.async).toBe(true)
		const restore = createCryptoProEmulation().install()
		script?.dispatchEvent(new Event('load'))
		await expect(checking).resolves.toBe(true)
		restore()
		await expect(check()).resolves.toBe(false)
		expect(status.error?.code).toBe('scriptFailed')
		expect(status.error?.detail).toBe(url)
		expect(scriptsOf(url)).toHaveLength(1)
	})

	it('scriptUrl — ref', async () => {
		const url = 'https://cdn.example.ru/cades-ref.js'
		const { check } = useCryptoPro({ scriptUrl: ref(url) })
		const checking = check()
		const [script] = await appendedScripts(url)
		createCryptoProEmulation().install()
		script?.dispatchEvent(new Event('load'))
		await expect(checking).resolves.toBe(true)
	})

	it('скрипт загрузился, а cadesplugin нет — scriptFailed', async () => {
		const url = 'https://cdn.example.ru/cades-empty.js'
		const { status, check } = useCryptoPro({ scriptUrl: url })
		const checking = check()
		const [script] = await appendedScripts(url)
		script?.dispatchEvent(new Event('load'))
		await expect(checking).resolves.toBe(false)
		expect(status.error?.code).toBe('scriptFailed')
		expect(status.error?.message).toBe('Не удалось загрузить скрипт cadesplugin_api.js')
	})

	it('ошибка скрипта — scriptFailed, следующая проверка пробует снова', async () => {
		const url = 'https://cdn.example.ru/cades-error.js'
		const { status, check } = useCryptoPro({ scriptUrl: url })
		const checking = check()
		const [script] = await appendedScripts(url)
		script?.dispatchEvent(new Event('error'))
		await expect(checking).resolves.toBe(false)
		expect(status.error?.code).toBe('scriptFailed')
		expect(stepStates(status)).toEqual(['error', 'pending', 'pending', 'pending'])
		const retry = check()
		const scripts = await appendedScripts(url, 2)
		createCryptoProEmulation().install()
		scripts[1]?.dispatchEvent(new Event('load'))
		await expect(retry).resolves.toBe(true)
	})

	it('скрипт не ответил за timeout — scriptFailed', async () => {
		const url = 'https://cdn.example.ru/cades-timeout.js'
		const { status, check } = useCryptoPro({ scriptUrl: url, timeout: 10 })
		await expect(check()).resolves.toBe(false)
		expect(status.error?.code).toBe('scriptFailed')
		expect(status.error?.detail).toBe(url)
	})
})

describe('useCryptoPro — жизненный цикл и SSR', () => {
	const Probe = defineComponent({
		props: { checkOnMount: { type: Boolean, default: undefined } },
		setup(props) {
			const { status } = useCryptoPro({ checkOnMount: props.checkOnMount })
			return () => h('div', status.state)
		},
	})

	it('в компоненте проверка — в onMounted', async () => {
		const emulation = createCryptoProEmulation()
		emulation.install()
		const wrapper = mount(Probe)
		await flushPromises()
		expect(wrapper.text()).toBe('ready')
		expect(aboutCalls(emulation.calls)).toBe(1)
		wrapper.unmount()
	})

	it('checkOnMount: false — без проверки', async () => {
		const emulation = createCryptoProEmulation()
		emulation.install()
		const wrapper = mount(Probe, { props: { checkOnMount: false } })
		await flushPromises()
		expect(wrapper.text()).toBe('idle')
		expect(emulation.calls).toEqual([])
		wrapper.unmount()
	})

	it('вне компонента проверка сама не запускается', async () => {
		const emulation = createCryptoProEmulation()
		emulation.install()
		const { status } = useCryptoPro()
		await flushPromises()
		expect(status.state).toBe('idle')
		expect(emulation.calls).toEqual([])
	})

	it('SSR: до монтирования ни скрипта, ни колбэка расширения', async () => {
		const app = createSSRApp({
			setup() {
				const { status } = useCryptoPro({ scriptUrl: 'https://cdn.example.ru/cades-ssr.js' })
				return () => h('div', status.state)
			},
		})
		await expect(renderToString(app)).resolves.toBe('<div>idle</div>')
		expect(document.head.querySelector('script')).toBeNull()
		expect(callbackWindow.cadesplugin_extension_loaded_callback).toBeUndefined()
	})
})
