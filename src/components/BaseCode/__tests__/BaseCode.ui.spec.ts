import '@testing-library/jest-dom/vitest'
import BaseCode from '../ui/BaseCode.vue'
import { createUiKitPlugin } from '@/plugin'
import { CODE_PARTS } from '../types/BaseCode.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const PARTS = CODE_PARTS.filter(part => part !== 'empty')

afterEach(() => vi.unstubAllGlobals())

describe('BaseCode: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseCode, { props: { code: 'a', language: 'js' } })
		const root = container.querySelector('.base-code')!

		expect(root).toHaveAttribute('class', 'base-code base-code--numbered')
		for (const part of PARTS) {
			const classes = [...root.querySelector(`.base-code__${part}`)!.classList]
			expect(classes.filter(name => !name.startsWith('base-'))).toEqual([])
		}
		expect(root.querySelector('.base-code__header')).toHaveAttribute('class', 'base-code__header')
		expect(root.querySelector('.base-code__line')).toHaveAttribute('class', 'base-code__line')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...CODE_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseCode, {
			props: { code: 'a\nb', highlightLines: [1], variant: 'soft', customClass: { root: 'own-root', line: 'own-line' }, ui },
		})
		const root = container.querySelector('.base-code')!

		expect(root).toHaveClass('base-code', 'u-root', 'base-code--soft', 'own-root')
		for (const part of PARTS) expect(root.querySelector(`.base-code__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-code__line')).toHaveClass('base-code__line--highlighted', 'own-line', 'u-line')
	})

	it('часть empty — у надписи пустого кода', () => {
		const { container } = render(BaseCode, { props: { code: '', ui: { empty: 'u-empty' } } })

		expect(container.querySelector('.base-code__empty')).toHaveClass('u-empty')
	})

	it('классы из defaults.BaseCode.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseCode, {
			props: { code: 'a', ui: { header: 'own-header' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCode: { ui: { root: 'app-root', header: 'app-header' } } } })] },
		})

		expect(container.querySelector('.base-code')).toHaveClass('app-root')
		expect(container.querySelector('.base-code__header')).toHaveAttribute('class', 'base-code__header app-header own-header')
	})
})

describe('BaseCode: смена иконки «Копировать»', () => {
	it('иконка в Transition сменяется по ключу: copy → check', async () => {
		vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
		const { container } = render(BaseCode, { props: { code: 'a' }, global: { stubs: { transition: false } } })
		const icon = () => container.querySelector('.base-code__copy .base-icon use')?.getAttribute('href') ?? ''

		expect(icon()).toMatch(/copy$/)
		await fireEvent.click(screen.getByRole('button', { name: 'Копировать код' }))
		await vi.waitFor(() => expect(icon()).toMatch(/check$/))
		expect(container.querySelectorAll('.base-code__copy .base-icon')).toHaveLength(1)
	})
})
