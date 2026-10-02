import '@testing-library/jest-dom/vitest'
import BaseTag from '../ui/BaseTag.vue'
import { createUiKitPlugin } from '@/plugin'
import { fireEvent, render, screen } from '@testing-library/vue'

const root = (container: Element) => container.querySelector('.base-tag') as HTMLElement

describe('BaseTag unit', () => {
	describe('рендер', () => {
		it('показывает текст из label в неинтерактивной метке', () => {
			const { container } = render(BaseTag, { props: { label: 'Vue' } })

			expect(screen.getByText('Vue')).toBeInTheDocument()
			expect(container.querySelector('.base-tag__main')?.tagName).toBe('SPAN')
			expect(screen.queryByRole('button')).not.toBeInTheDocument()
		})

		it('показывает слот default вместо label', () => {
			render(BaseTag, { props: { label: 'Vue' }, slots: { default: '<b>Слот</b>' } })

			expect(screen.getByText('Слот')).toBeInTheDocument()
			expect(screen.queryByText('Vue')).not.toBeInTheDocument()
		})

		it('показывает значок из icon и слот icon вместо него', () => {
			const { container } = render(BaseTag, { props: { label: 'Vue', icon: 'star' } })

			expect(container.querySelector('.base-tag__icon')).toBeInTheDocument()

			const slotted = render(BaseTag, { props: { label: 'Vue', icon: 'star' }, slots: { icon: '<i class="own-icon" />' } })
			expect(slotted.container.querySelector('.base-tag__icon .own-icon')).toBeInTheDocument()
		})

		it('без значка не рендерит место под него', () => {
			const { container } = render(BaseTag, { props: { label: 'Vue' } })

			expect(container.querySelector('.base-tag__icon')).not.toBeInTheDocument()
		})
	})

	describe('оформление', () => {
		it('по умолчанию — нейтральная роль, вариант default', () => {
			const { container } = render(BaseTag, { props: { label: 'Vue' } })

			expect(root(container)).toHaveClass('base-tag--tone-neutral')
			expect(root(container)).not.toHaveClass('base-tag--outline')
		})

		it.each(['primary', 'info', 'success', 'warning', 'error'] as const)('роль %s — модификатор', tone => {
			const { container } = render(BaseTag, { props: { label: 'Vue', tone } })

			expect(root(container)).toHaveClass(`base-tag--tone-${tone}`)
		})

		it('вариант outline — модификатор', () => {
			const { container } = render(BaseTag, { props: { label: 'Vue', variant: 'outline' } })

			expect(root(container)).toHaveClass('base-tag--outline')
		})

		it('sizeScale ставит --size-scale', () => {
			const { container } = render(BaseTag, { props: { label: 'Vue', sizeScale: 125 } })

			expect(root(container).style.getPropertyValue('--size-scale')).toBe('1.25')
		})

		it('customClass по элементам', () => {
			const { container } = render(BaseTag, {
				props: { label: 'Vue', isRemovable: true, customClass: { root: 'r', main: 'm', text: 't', remove: 'x' } },
			})

			expect(root(container)).toHaveClass('r')
			expect(container.querySelector('.base-tag__main')).toHaveClass('m')
			expect(container.querySelector('.base-tag__text')).toHaveClass('t')
			expect(container.querySelector('.base-tag__remove')).toHaveClass('x')
		})

		it('color ставит --custom-bg на метку', () => {
			const { container } = render(BaseTag, { props: { label: 'Vue', color: { bg: { base: 'var(--rise-info)' } } } })

			expect(root(container).style.getPropertyValue('--custom-bg')).toBe('var(--rise-info)')
		})
	})

	describe('выбираемая метка', () => {
		it('кнопка-переключатель с aria-pressed', () => {
			render(BaseTag, { props: { label: 'Vue', isSelectable: true } })

			const button = screen.getByRole('button', { name: 'Vue' })
			expect(button).toHaveAttribute('type', 'button')
			expect(button).toHaveAttribute('aria-pressed', 'false')
		})

		it('клик меняет выбор и приходит click', async () => {
			const { emitted } = render(BaseTag, { props: { label: 'Vue', isSelectable: true } })

			await fireEvent.click(screen.getByRole('button', { name: 'Vue' }))

			expect(emitted('update:isSelected')).toEqual([[true]])
			expect(emitted('click')).toHaveLength(1)
		})

		it('выбранная — aria-pressed="true", галочка и модификатор; клик снимает выбор', async () => {
			const { container, emitted } = render(BaseTag, { props: { label: 'Vue', isSelectable: true, isSelected: true, icon: 'star' } })

			const button = screen.getByRole('button', { name: 'Vue' })
			expect(button).toHaveAttribute('aria-pressed', 'true')
			expect(root(container)).toHaveClass('base-tag--selected')
			expect(container.querySelectorAll('.base-tag__icon')).toHaveLength(1)

			await fireEvent.click(button)
			expect(emitted('update:isSelected')).toEqual([[false]])
		})

		it('isSelected без isSelectable не выделяет метку', () => {
			const { container } = render(BaseTag, { props: { label: 'Vue', isSelected: true } })

			expect(root(container)).not.toHaveClass('base-tag--selected')
		})

		it('выключенная — disabled, клик ничего не шлёт', async () => {
			const { emitted } = render(BaseTag, { props: { label: 'Vue', isSelectable: true, isDisabled: true } })

			const button = screen.getByRole('button', { name: 'Vue' })
			expect(button).toBeDisabled()
			await fireEvent.click(button)
			expect(emitted('update:isSelected')).toBeUndefined()
			expect(emitted('click')).toBeUndefined()
		})
	})

	describe('кликабельная метка', () => {
		it('с @click — role="button" и фокус, Enter вызывает click', async () => {
			const onClick = vi.fn()
			render(BaseTag, { props: { label: 'Vue', onClick } })

			const tag = screen.getByRole('button', { name: 'Vue' })
			expect(tag).toHaveAttribute('tabindex', '0')
			await fireEvent.keyDown(tag, { key: 'Enter' })
			expect(onClick).toHaveBeenCalledTimes(1)
		})

		it('выключенная — aria-disabled, без фокуса и клика', async () => {
			const onClick = vi.fn()
			render(BaseTag, { props: { label: 'Vue', onClick, isDisabled: true } })

			const tag = screen.getByRole('button', { name: 'Vue' })
			expect(tag).toHaveAttribute('aria-disabled', 'true')
			expect(tag).not.toHaveAttribute('tabindex')
			await fireEvent.click(tag)
			expect(onClick).not.toHaveBeenCalled()
		})
	})

	describe('удаляемая метка', () => {
		it('кнопка «Удалить метку …» шлёт remove', async () => {
			const { emitted } = render(BaseTag, { props: { label: 'Vue', isRemovable: true } })

			const remove = screen.getByRole('button', { name: 'Удалить метку Vue' })
			expect(remove).not.toHaveAttribute('tabindex')
			await fireEvent.click(remove)
			expect(emitted('remove')).toHaveLength(1)
		})

		it('без label — «Удалить метку», removeLabel — своё имя', () => {
			const { rerender } = render(BaseTag, { props: { isRemovable: true }, slots: { default: 'Vue' } })

			expect(screen.getByRole('button', { name: 'Удалить метку' })).toBeInTheDocument()

			return rerender({ isRemovable: true, removeLabel: 'Убрать фильтр Vue' }).then(() => {
				expect(screen.getByRole('button', { name: 'Убрать фильтр Vue' })).toBeInTheDocument()
			})
		})

		it.each(['Delete', 'Backspace'])('%s на кнопке удаления шлёт remove', async key => {
			const { emitted } = render(BaseTag, { props: { label: 'Vue', isRemovable: true } })

			await fireEvent.keyDown(screen.getByRole('button', { name: 'Удалить метку Vue' }), { key })

			expect(emitted('remove')).toHaveLength(1)
		})

		it('у выбираемой: Delete на метке удаляет, кнопка удаления вне Tab, aria-keyshortcuts', async () => {
			const { emitted } = render(BaseTag, { props: { label: 'Vue', isRemovable: true, isSelectable: true } })

			const main = screen.getByRole('button', { name: 'Vue' })
			expect(main).toHaveAttribute('aria-keyshortcuts', 'Delete Backspace')
			expect(screen.getByRole('button', { name: 'Удалить метку Vue' })).toHaveAttribute('tabindex', '-1')

			await fireEvent.keyDown(main, { key: 'Delete' })
			expect(emitted('remove')).toHaveLength(1)
			expect(emitted('update:isSelected')).toBeUndefined()
		})

		it('другие клавиши не удаляют', async () => {
			const { emitted } = render(BaseTag, { props: { label: 'Vue', isRemovable: true } })

			await fireEvent.keyDown(screen.getByRole('button', { name: 'Удалить метку Vue' }), { key: 'a' })

			expect(emitted('remove')).toBeUndefined()
		})

		it('неудаляемая не реагирует на Delete и без aria-keyshortcuts', async () => {
			const { emitted } = render(BaseTag, { props: { label: 'Vue', isSelectable: true } })

			const main = screen.getByRole('button', { name: 'Vue' })
			expect(main).not.toHaveAttribute('aria-keyshortcuts')
			await fireEvent.keyDown(main, { key: 'Delete' })
			expect(emitted('remove')).toBeUndefined()
		})

		it('выключенная: кнопка удаления disabled, Delete не удаляет', async () => {
			const { emitted } = render(BaseTag, { props: { label: 'Vue', isRemovable: true, isDisabled: true } })

			const remove = screen.getByRole('button', { name: 'Удалить метку Vue' })
			expect(remove).toBeDisabled()
			await fireEvent.keyDown(remove, { key: 'Delete' })
			expect(emitted('remove')).toBeUndefined()
		})
	})

	describe('defaults плагина', () => {
		it('берёт tone и variant из defaults.BaseTag', () => {
			const { container } = render(BaseTag, {
				props: { label: 'Vue' },
				global: { plugins: [createUiKitPlugin({ defaults: { BaseTag: { tone: 'success', variant: 'outline' } } })] },
			})

			expect(root(container)).toHaveClass('base-tag--tone-success', 'base-tag--outline')
		})
	})
})
