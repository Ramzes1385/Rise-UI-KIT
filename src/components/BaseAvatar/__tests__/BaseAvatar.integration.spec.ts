import '@testing-library/jest-dom/vitest'
import { UI_ARIA } from '@/locales/messages'
import BaseAvatar from '../ui/BaseAvatar.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseAvatar integration', () => {
	describe('emit click', () => {
		it('должен вызывать emit click при клике на аватар', async () => {
			const { container, emitted } = render(BaseAvatar)

			await fireEvent.click(container.querySelector('.base-avatar')!)

			expect(emitted()).toHaveProperty('click')
			expect(emitted().click).toHaveLength(1)
		})

		it('должен вызывать emit click только один раз при одном клике', async () => {
			const { container, emitted } = render(BaseAvatar)

			await fireEvent.click(container.querySelector('.base-avatar')!)

			expect(emitted().click).toHaveLength(1)
		})
	})

	describe('изображение', () => {
		it('должен рендерить изображение с alt когда передан src', () => {
			render(BaseAvatar, {
				props: { src: '/avatar.jpg', alt: 'Фото' },
			})

			const img = screen.getByRole('img', { name: 'Фото' })
			expect(img).toHaveClass('base-avatar__img')
			expect(img).toHaveAttribute('src', '/avatar.jpg')
		})

		it('не должен рендерить изображение когда src не передан', () => {
			const { container } = render(BaseAvatar, {
				props: { name: 'Иван' },
			})

			expect(container.querySelector('.base-avatar__img')).not.toBeInTheDocument()
		})
	})

	describe('инициалы', () => {
		it('должен рендерить инициалы когда нет src', () => {
			render(BaseAvatar, {
				props: { name: 'Иван Петров' },
			})

			expect(screen.getByText('ИП')).toBeInTheDocument()
		})

		it('должен рендерить "?" когда нет имени и src', () => {
			render(BaseAvatar)

			expect(screen.getByText('?')).toBeInTheDocument()
		})

		it('не должен рендерить инициалы когда есть src', () => {
			const { container } = render(BaseAvatar, {
				props: { src: '/avatar.jpg', name: 'Иван Петров' },
			})

			expect(container.querySelector('.base-avatar__initials')).not.toBeInTheDocument()
		})
	})

	describe('комбинированные сценарии', () => {
		it('должен рендерить изображение и emit click вместе', async () => {
			const { container, emitted } = render(BaseAvatar, {
				props: { src: '/avatar.jpg', alt: 'Фото' },
			})

			await fireEvent.click(container.querySelector('.base-avatar')!)

			expect(container.querySelector('.base-avatar__img')).toBeInTheDocument()
			expect(emitted()).toHaveProperty('click')
		})

		it('должен рендерить онлайн-индикатор и инициалы вместе', () => {
			const { container } = render(BaseAvatar, {
				props: { name: 'Иван', isOnline: true },
			})

			expect(screen.getByText('И')).toBeInTheDocument()
			expect(container.querySelector('.base-avatar__online')).toBeInTheDocument()
		})
	})

	describe('клавиатура (fu-keyboard)', () => {
		it('с обработчиком — кнопка с именем из alt, Enter и Space вызывают click', async () => {
			const user = userEvent.setup()
			const onClick = vi.fn()
			render(BaseAvatar, { props: { name: 'Анна Смирнова', alt: 'Профиль Анны', onClick } })

			const avatar = screen.getByRole('button', { name: 'Профиль Анны' })
			await user.tab()
			expect(avatar).toHaveFocus()
			await user.keyboard('{Enter}')
			await user.keyboard(' ')
			expect(onClick).toHaveBeenCalledTimes(2)
		})

		it('имя кнопки — name без alt, иначе «Аватар» из словаря', () => {
			render(BaseAvatar, { props: { name: 'Анна Смирнова', onClick: vi.fn() } })
			render(BaseAvatar, { props: { onClick: vi.fn() } })

			expect(screen.getByRole('button', { name: 'Анна Смирнова' })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: UI_ARIA.AVATAR })).toBeInTheDocument()
		})

		it('без обработчика — не кнопка, без tabindex и aria-label', () => {
			const { container } = render(BaseAvatar, { props: { name: 'Анна Смирнова' } })

			const avatar = container.querySelector('.base-avatar')
			expect(screen.queryByRole('button')).not.toBeInTheDocument()
			expect(avatar).not.toHaveAttribute('tabindex')
			expect(avatar).not.toHaveAttribute('aria-label')
		})

		it('выключенный — aria-disabled, без фокуса и без click', async () => {
			const user = userEvent.setup()
			const onClick = vi.fn()
			render(BaseAvatar, { props: { name: 'Анна', isDisabled: true, onClick } })

			const avatar = screen.getByRole('button', { name: 'Анна' })
			expect(avatar).toHaveAttribute('aria-disabled', 'true')
			expect(avatar).toHaveClass('base-avatar--disabled')
			await user.tab()
			expect(avatar).not.toHaveFocus()
			await user.click(avatar)
			expect(onClick).not.toHaveBeenCalled()
		})
	})
})
