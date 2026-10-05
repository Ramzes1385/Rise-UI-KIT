import '@testing-library/jest-dom/vitest'
import BaseBadge from '../ui/BaseBadge.vue'
import { createUiKitPlugin } from '@/plugin'
import { render, waitFor } from '@testing-library/vue'

const text = (container: Element) => container.querySelectorAll('.base-badge__text')

describe('BaseBadge: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseBadge, { props: { label: 'Новое' } })

		expect(container.querySelector('.base-badge')).toHaveAttribute('class', 'base-badge')
		expect(container.querySelector('.base-badge__text')).toHaveAttribute('class', 'base-badge__text')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseBadge, {
			props: {
				label: 'Новое',
				variant: 'soft',
				customClass: { root: 'own-root', text: 'own-text' },
				ui: { root: 'u-root', text: 'u-text' },
			},
		})

		expect(container.querySelector('.base-badge')).toHaveClass('base-badge', 'u-root', 'base-badge--soft', 'own-root')
		expect(container.querySelector('.base-badge__text')).toHaveClass('u-text', 'own-text')
	})

	it('классы из defaults.BaseBadge.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseBadge, {
			props: { label: 'Новое', ui: { text: 'own-text' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseBadge: { ui: { root: 'app-root', text: 'app-text' } } } })] },
		})

		expect(container.querySelector('.base-badge')).toHaveClass('app-root')
		expect(container.querySelector('.base-badge__text')).toHaveAttribute('class', 'base-badge__text app-text own-text')
	})
})

describe('BaseBadge: смена текста', () => {
	it('при первом показе текст без анимации появления', () => {
		const { container } = render(BaseBadge, { props: { label: '3' }, global: { stubs: { Transition: false } } })

		expect(container.querySelector('.base-badge__text')).not.toHaveClass('base-badge-text-enter-active')
	})

	it('новое значение появляется с pop по ключу, старое уходит и удаляется', async () => {
		const { container, rerender } = render(BaseBadge, { props: { label: '3' }, global: { stubs: { Transition: false } } })

		await rerender({ label: '4' })

		const [leaving, entering] = text(container)
		expect(leaving).toHaveTextContent('3')
		expect(leaving).toHaveClass('base-badge-text-leave-active')
		expect(entering).toHaveTextContent('4')
		expect(entering).toHaveClass('base-badge-text-enter-active')
		await waitFor(() => expect(text(container)).toHaveLength(1))
		expect(text(container)[0]).toHaveTextContent('4')
		await waitFor(() => expect(text(container)[0]).toHaveAttribute('class', 'base-badge__text'))
	})

	it('слот default заменяет текст без обёртки перехода', () => {
		const { container } = render(BaseBadge, { slots: { default: '<b>Свой</b>' }, global: { stubs: { Transition: false } } })

		expect(container.querySelector('.base-badge__text')).toBeNull()
		expect(container.querySelector('b')).toHaveTextContent('Свой')
	})
})
