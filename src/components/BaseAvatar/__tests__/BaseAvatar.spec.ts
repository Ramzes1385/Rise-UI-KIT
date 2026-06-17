/**
 * Unit-тесты для BaseAvatar.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseAvatar from '../ui/BaseAvatar.vue'

function getElement(selector: string, root: ParentNode): Element {
	const element = root.querySelector(selector)
	if (!element) {
		throw new Error(`Элемент ${selector} не найден`)
	}
	return element
}

describe('BaseAvatar unit', () => {
	describe('рендер', () => {
		it('должен рендерить аватар', () => {
			const { container } = render(BaseAvatar)

			expect(container.querySelector('.base-avatar')).toBeInTheDocument()
		})

		it('должен рендерить "?" когда нет имени и изображения', () => {
			render(BaseAvatar)

			expect(screen.getByText('?')).toBeInTheDocument()
		})
	})

	describe('пропс src', () => {
		it('должен рендерить BaseImage когда передан src', () => {
			const { container } = render(BaseAvatar, {
				props: { src: '/avatar.jpg', alt: 'Аватар' },
			})

			const img = container.querySelector('.base-avatar__img')
			expect(img).toBeInTheDocument()
		})

		it('должен показывать инициалы после ошибки изображения и сбрасывать ошибку при смене src', async function () {
			const { container, rerender } = render(BaseAvatar, {
				props: { src: '/avatar.jpg', alt: 'Аватар', name: 'Иван Петров' },
			})

			await fireEvent.error(getElement('.base-image__img', container))

			expect(screen.getByText('ИП')).toBeInTheDocument()

			await rerender({ src: '/avatar-new.jpg', alt: 'Аватар', name: 'Иван Петров' })

			expect(getElement('.base-avatar__img', container)).toBeInTheDocument()
		})

		it('должен рендерить инициалы когда src не передан', () => {
			render(BaseAvatar, { props: { name: 'Иван Петров' } })

			expect(screen.getByText('ИП')).toBeInTheDocument()
		})
	})

	describe('пропс name', () => {
		it('должен генерировать инициалы из имени', () => {
			render(BaseAvatar, { props: { name: 'Иван Петров' } })

			expect(screen.getByText('ИП')).toBeInTheDocument()
		})

		it('должен брать максимум 2 инициала', () => {
			render(BaseAvatar, { props: { name: 'Иван Петров Сидоров' } })

			expect(screen.getByText('ИП')).toBeInTheDocument()
		})

		it('должен рендерить "?" когда имя не передано', () => {
			render(BaseAvatar)

			expect(screen.getByText('?')).toBeInTheDocument()
		})
	})

	describe('пропс shape', () => {
		it('должен применять модификатор --circle по умолчанию', () => {
			const { container } = render(BaseAvatar)

			expect(container.querySelector('.base-avatar')?.classList.contains('base-avatar--circle')).toBe(true)
		})

		it('должен применять модификатор --square когда shape=square', () => {
			const { container } = render(BaseAvatar, { props: { shape: 'square' } })

			expect(container.querySelector('.base-avatar')?.classList.contains('base-avatar--square')).toBe(true)
		})
	})

	describe('пропс variant', () => {
		it('должен применять модификатор --outline когда variant=outline', () => {
			const { container } = render(BaseAvatar, { props: { variant: 'outline' } })

			expect(container.querySelector('.base-avatar')?.classList.contains('base-avatar--outline')).toBe(true)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseAvatar)

			const style = container.querySelector('.base-avatar')?.getAttribute('style') ?? ''
			expect(style).not.toContain('--size-scale:')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseAvatar, { props: { sizeScale: 150 } })

			expect(container.querySelector('.base-avatar')?.getAttribute('style')).toContain('--size-scale: 1.5')
		})
	})

	describe('пропс isOnline', () => {
		it('должен рендерить индикатор онлайн когда isOnline=true', () => {
			const { container } = render(BaseAvatar, { props: { isOnline: true } })

			expect(container.querySelector('.base-avatar__online')).toBeInTheDocument()
		})

		it('не должен рендерить индикатор онлайн когда isOnline=false', () => {
			const { container } = render(BaseAvatar, { props: { isOnline: false } })

			expect(container.querySelector('.base-avatar__online')).not.toBeInTheDocument()
		})
	})

	describe('emit click', () => {
		it('должен эмитить click при клике на аватар', async () => {
			const { emitted, container } = render(BaseAvatar)

			const avatar = container.querySelector('.base-avatar') as HTMLElement
			avatar.dispatchEvent(new Event('click'))

			const clickEvents = emitted()['click']
			expect(clickEvents).toBeTruthy()
		})
	})

	describe('слот default', () => {
		it('должен заменять контент при передаче слота default', () => {
			const { container } = render(BaseAvatar, {
				slots: { default: '<span class="custom-slot">Custom</span>' },
			})

			expect(container.querySelector('.custom-slot')).toBeInTheDocument()
		})

		it('не должен рендерить инициалы когда передан слот default', () => {
			const { container } = render(BaseAvatar, {
				slots: { default: '<span class="custom-slot">Custom</span>' },
			})

			expect(container.querySelector('.base-avatar__initials')).not.toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseAvatar, {
				props: { customClass: 'my-custom-avatar-class' },
			})

			expect(container.querySelector('.base-avatar')?.classList.contains('my-custom-avatar-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseAvatar, {
				props: {
					customClass: {
						root: 'my-avatar-root',
						content: 'my-avatar-content',
						online: 'my-avatar-online',
					},
					isOnline: true,
				},
			})

			const root = container.querySelector('.base-avatar')
			const content = container.querySelector('.base-avatar__content')
			const online = container.querySelector('.base-avatar__online')

			expect(root?.classList.contains('my-avatar-root')).toBe(true)
			expect(content?.classList.contains('my-avatar-content')).toBe(true)
			expect(online?.classList.contains('my-avatar-online')).toBe(true)
		})
	})
})
