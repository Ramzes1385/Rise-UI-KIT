import '@testing-library/jest-dom/vitest'
import BaseTag from '../ui/BaseTag.vue'
import { createUiKitPlugin } from '@/plugin'
import { render, screen, waitFor } from '@testing-library/vue'

const NO_STUBS = { stubs: { Transition: false } }

describe('BaseTag: проп ui', () => {
	it('без ui — только классы кита на всех частях', () => {
		const { container } = render(BaseTag, { props: { label: 'Vue', icon: 'star', isRemovable: true } })
		const root = container.querySelector('.base-tag')!

		expect(root.className).toMatch(/^base-tag /)
		expect(root.querySelector('.base-tag__main')).toHaveAttribute('class', 'base-tag__main')
		expect(root.querySelector('.base-tag__text')).toHaveAttribute('class', 'base-tag__text')
		expect(root.querySelector('.base-tag__remove')).toHaveAttribute('class', 'base-tag__remove')
		expect(root.querySelector('.base-tag__icon')!.className).toMatch(/^base-icon base-tag__icon$/)
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseTag, {
			props: {
				label: 'Vue',
				isSelectable: true,
				isSelected: true,
				isRemovable: true,
				variant: 'outline',
				customClass: { root: 'own-root', text: 'own-text' },
				ui: { root: 'u-root', main: 'u-main', icon: 'u-icon', text: 'u-text', remove: 'u-remove' },
			},
		})
		const root = container.querySelector('.base-tag')!

		expect(root).toHaveClass('base-tag', 'u-root', 'base-tag--outline', 'base-tag--selected', 'own-root')
		expect(root.querySelector('.base-tag__main')).toHaveClass('u-main')
		expect(root.querySelector('.base-tag__icon')).toHaveClass('u-icon')
		expect(root.querySelector('.base-tag__text')).toHaveClass('u-text', 'own-text')
		expect(root.querySelector('.base-tag__remove')).toHaveClass('u-remove')
	})

	it('часть icon у значка из слота', () => {
		const { container } = render(BaseTag, { props: { label: 'Vue', ui: { icon: 'u-icon' } }, slots: { icon: '<i>*</i>' } })

		expect(container.querySelector('.base-tag__icon')).toHaveAttribute('class', 'base-tag__icon u-icon')
	})

	it('классы из defaults.BaseTag.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseTag, {
			props: { label: 'Vue', ui: { text: 'own-text' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTag: { ui: { root: 'app-root', text: 'app-text' } } } })] },
		})

		expect(container.querySelector('.base-tag')).toHaveClass('base-tag', 'app-root')
		expect(container.querySelector('.base-tag__text')).toHaveAttribute('class', 'base-tag__text app-text own-text')
	})
})

describe('BaseTag: движение', () => {
	it('галочка появляется и уходит через переход base-tag__icon, затем остаётся конечное состояние', async () => {
		const { container, rerender } = render(BaseTag, { props: { label: 'Vue', isSelectable: true }, global: NO_STUBS })

		await rerender({ label: 'Vue', isSelectable: true, isSelected: true })
		const check = container.querySelector('.base-tag__icon')!
		expect(check).toHaveClass('base-tag__icon-enter-active')
		await waitFor(() => expect(check).not.toHaveClass('base-tag__icon-enter-active'))

		await rerender({ label: 'Vue', isSelectable: true, isSelected: false })
		expect(check).toHaveClass('base-tag__icon-leave-active')
		await waitFor(() => expect(container.querySelector('.base-tag__icon')).not.toBeInTheDocument())
	})

	it('смена значка на галочку: старый уходит, новый появляется одновременно', async () => {
		const { container, rerender } = render(BaseTag, { props: { label: 'Vue', icon: 'star', isSelectable: true }, global: NO_STUBS })

		await rerender({ label: 'Vue', icon: 'star', isSelectable: true, isSelected: true })
		const icons = container.querySelectorAll('.base-tag__icon')
		expect(icons).toHaveLength(2)
		expect(icons[0]).toHaveClass('base-tag__icon-leave-active')
		expect(icons[1]).toHaveClass('base-tag__icon-enter-active')
		await waitFor(() => expect(container.querySelectorAll('.base-tag__icon')).toHaveLength(1))
	})

	it('кнопка удаления появляется и уходит через переход base-tag__remove', async () => {
		const { rerender } = render(BaseTag, { props: { label: 'Vue' }, global: NO_STUBS })

		await rerender({ label: 'Vue', isRemovable: true })
		const remove = screen.getByRole('button', { name: 'Удалить метку Vue' })
		expect(remove).toHaveClass('base-tag__remove-enter-active')

		await rerender({ label: 'Vue', isRemovable: false })
		expect(remove).toHaveClass('base-tag__remove-leave-active')
		await waitFor(() => expect(remove).not.toBeInTheDocument())
	})
})

describe('BaseTag: место под значок', () => {
	const lead = (container: Element) => container.querySelector('.base-tag__lead')!

	it('колонка значка закрыта без значка, открыта с icon, слотом icon и галочкой', async () => {
		const plain = render(BaseTag, { props: { label: 'Vue' } })
		expect(lead(plain.container)).not.toHaveClass('base-tag__lead--open')

		const withIcon = render(BaseTag, { props: { label: 'Vue', icon: 'star' } })
		expect(lead(withIcon.container)).toHaveClass('base-tag__lead--open')

		const slotted = render(BaseTag, { props: { label: 'Vue' }, slots: { icon: '<i>*</i>' } })
		expect(lead(slotted.container)).toHaveClass('base-tag__lead--open')

		const { container, rerender } = render(BaseTag, { props: { label: 'Vue', isSelectable: true }, global: NO_STUBS })
		expect(lead(container)).not.toHaveClass('base-tag__lead--open')
		await rerender({ label: 'Vue', isSelectable: true, isSelected: true })
		expect(lead(container)).toHaveClass('base-tag__lead--open')
	})

	it('значок лежит внутри колонки и при открытии, и при закрытии, пока уходит', async () => {
		const { container, rerender } = render(BaseTag, { props: { label: 'Vue', isSelectable: true }, global: NO_STUBS })

		await rerender({ label: 'Vue', isSelectable: true, isSelected: true })
		expect(container.querySelector('.base-tag__lead-clip > .base-tag__icon')).toBeInTheDocument()
		await rerender({ label: 'Vue', isSelectable: true, isSelected: false })
		expect(lead(container)).not.toHaveClass('base-tag__lead--open')
		expect(container.querySelector('.base-tag__lead-clip > .base-tag__icon-leave-active')).toBeInTheDocument()
	})
})
