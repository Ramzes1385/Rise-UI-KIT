import '@testing-library/jest-dom/vitest'
import { h, ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseDadataInput from '../ui/BaseDadataInput.vue'

describe('BaseDadataInput integration', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('ключ из настроек плагина; устаревший запрос отменяется, v-model — выбранная подсказка', async () => {
		const signals: AbortSignal[] = []
		const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
			signals.push(init.signal as AbortSignal)
			return { ok: true, json: async () => ({ suggestions: [{ value: 'ПАО СБЕРБАНК', data: { inn: '7707083893' } }] }) }
		})
		vi.stubGlobal('fetch', fetchMock)
		const user = userEvent.setup()
		const value = ref('')
		render(
			{
				render: () =>
					h(BaseDadataInput, {
						kind: 'party',
						label: 'Организация',
						debounce: 0,
						modelValue: value.value,
						'onUpdate:modelValue': (next: string) => (value.value = next),
					}),
			},
			{ global: { plugins: [createUiKitPlugin({ defaults: { BaseDadataInput: { token: 'PLUGIN-KEY' } } })] } },
		)

		await user.type(screen.getByRole('combobox', { name: 'Организация' }), 'сбер')
		await user.keyboard('{ArrowDown}{Enter}')

		expect(fetchMock.mock.calls[0][1].headers).toMatchObject({ Authorization: 'Token PLUGIN-KEY' })
		expect(signals.slice(0, -1).every(signal => signal.aborted)).toBe(true)
		expect(value.value).toBe('ПАО СБЕРБАНК')
	})
})
