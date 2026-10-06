import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseVoiceRecorder from '../ui/BaseVoiceRecorder.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { installRecorderEnvironment, removeRecorderEnvironment } from './recorder.test-utils'

const PARTS = ['dot', 'time', 'meter', 'level', 'status']
const RECORD = 'Записать голосовое сообщение'

function stubReducedMotion(matches: boolean) {
	vi.stubGlobal(
		'matchMedia',
		vi.fn((query: string) => ({
			matches: matches && query === '(prefers-reduced-motion: reduce)',
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		})),
	)
}

async function record(options: Parameters<typeof render>[1] = {}) {
	installRecorderEnvironment()
	const result = render(BaseVoiceRecorder, options)
	await fireEvent.click(screen.getByRole('button', { name: RECORD }))
	await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Остановить запись' })).toBeEnabled())
	return result
}

function levels(container: Element): string[] {
	return [...container.querySelectorAll<HTMLElement>('.base-voice-recorder__level')].map(level => level.style.transform)
}

describe('BaseVoiceRecorder: проп ui', () => {
	afterEach(() => {
		removeRecorderEnvironment()
	})

	it('классы частей записи добавляются к БЭМ-классам кита, customClass сохраняется', async () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(part => [part, `u-${part}`])])
		const { container } = await record({ props: { ui, customClass: { meter: 'own-meter' } } })
		const root = container.querySelector('.base-voice-recorder')!
		expect(root).toHaveClass('base-voice-recorder', 'base-voice-recorder--recording', 'u-root')
		for (const part of PARTS) expect(root.querySelector(`.base-voice-recorder__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-voice-recorder__meter')).toHaveClass('own-meter')
	})

	it('плеер прослушивания и текст ошибки получают классы ui', async () => {
		const { container } = await record({ props: { ui: { preview: 'u-preview', error: 'u-error' } } })
		await fireEvent.click(screen.getByRole('button', { name: 'Остановить запись' }))
		expect(container.querySelector('.base-voice-recorder__preview')).toHaveClass('u-preview')

		removeRecorderEnvironment()
		const failed = render(BaseVoiceRecorder, { props: { ui: { error: 'u-error' } } })
		await fireEvent.click(failed.getByRole('button', { name: RECORD }))
		expect(failed.container.querySelector('.base-voice-recorder__error')).toHaveClass('u-error')
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', () => {
		const { container } = render(BaseVoiceRecorder, {
			props: { ui: { status: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseVoiceRecorder: { ui: { status: 'app', root: 'app-root' } } } })] },
		})
		expect(container.querySelector('.base-voice-recorder')).toHaveClass('app-root')
		expect(container.querySelector('.base-voice-recorder__status')).toHaveAttribute('class', 'base-voice-recorder__status app own')

		const plain = render(BaseVoiceRecorder)
		expect(plain.container.querySelectorAll('.base-voice-recorder__status')[0]).toHaveAttribute('class', 'base-voice-recorder__status')
	})
})

describe('BaseVoiceRecorder: движение индикатора уровня', () => {
	afterEach(() => {
		removeRecorderEnvironment()
	})

	it('уровень — transform: scaleY без inline height; тишина — не ниже 6 %', async () => {
		const { container } = await record()
		const values = levels(container)
		expect(values).toHaveLength(32)
		expect(values.slice(0, 29)).toEqual(Array.from({ length: 29 }, () => 'scaleY(0.06)'))
		expect(values.slice(29)).toEqual(['scaleY(0.75)', 'scaleY(0.75)', 'scaleY(0.75)'])
		expect(container.querySelector<HTMLElement>('.base-voice-recorder__level')!.style.height).toBe('')
	})

	it('при prefers-reduced-motion и пресете none — сразу конечный уровень', async () => {
		stubReducedMotion(true)
		const reduced = await record()
		expect(levels(reduced.container).at(-1)).toBe('scaleY(0.75)')
		reduced.unmount()
		removeRecorderEnvironment()

		const none = await record({ global: { plugins: [createUiKitPlugin({ motion: 'none' })] } })
		expect(levels(none.container).at(-1)).toBe('scaleY(0.75)')
	})
})
