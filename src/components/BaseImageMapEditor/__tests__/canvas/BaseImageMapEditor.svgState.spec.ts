import '@testing-library/jest-dom/vitest'
import { screen, waitFor } from '@testing-library/vue'
import { makeMap, renderEditor } from '../utils/editorTestUtils'
import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'

const PLAN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect id="hall" width="10" height="10"/></svg>'

function urlMap(svgUrl: string): ImageMapData {
	return { version: 1, layers: [{ id: 'f1', title: 'Этаж', svgUrl, width: 800, height: 400 }], objects: [] }
}

function deferred<T>() {
	let resolve: (value: T) => void = () => {}
	const promise = new Promise<T>(done => {
		resolve = done
	})
	return { promise, resolve }
}

function svgState(container: Element): HTMLElement | null {
	return container.querySelector('.base-image-map-editor__svg-state')
}

describe('BaseImageMapEditor — загрузка SVG по svgUrl', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('показывает «Загрузка карты…», затем план без сообщения', async () => {
		const response = deferred<Response>()
		vi.stubGlobal(
			'fetch',
			vi.fn(() => response.promise),
		)
		const { container } = renderEditor({ modelValue: urlMap('/plan.svg') })
		await waitFor(() => expect(svgState(container)).toHaveTextContent('Загрузка карты…'))
		expect(screen.queryByRole('alert')).toBeNull()
		response.resolve({ ok: true, text: async () => PLAN } as Response)
		await waitFor(() => expect(container.querySelector('.base-image-map-editor__svg')).not.toBeNull())
		expect(svgState(container)).toBeNull()
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('ошибка загрузки — сообщение role=alert', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({ ok: false, text: async () => '' }) as Response),
		)
		renderEditor({ modelValue: urlMap('/404.svg') })
		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Не удалось загрузить карту'))
		expect(screen.getByRole('alert')).toHaveClass('base-image-map-editor__svg-state--error')
	})
})

describe('BaseImageMapEditor — текст error', () => {
	it('холст описан подсказкой и текстом ошибки через aria-describedby', async () => {
		const { container, rerender } = renderEditor({ modelValue: makeMap() })
		const stage = container.querySelector('.base-image-map-editor__stage') as HTMLElement
		const help = container.querySelector('.base-image-map-editor__help') as HTMLElement
		expect(stage).toHaveAttribute('aria-describedby', help.id)
		await rerender({ error: 'Отметьте вход' })
		const error = container.querySelector('.base-image-map-editor__error') as HTMLElement
		expect(error).toHaveTextContent('Отметьте вход')
		expect(stage).toHaveAttribute('aria-describedby', `${help.id} ${error.id}`)
		expect(stage).toHaveAccessibleDescription(expect.stringContaining('Отметьте вход'))
	})
})
