/**
 * Unit-тесты для BaseAlert.
 * Проверяют рендер, пропсы, слоты и события.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseAlert from '../ui/BaseAlert.vue'

describe('BaseAlert unit', () => {
	describe('рендер', () => {
		it('должен рендерить алерт', () => {
			const { container } = render(BaseAlert)

			expect(container.querySelector('.base-alert')).toBeInTheDocument()
		})

		it('должен рендерить заголовок и описание', () => {
			render(BaseAlert, {
				props: {
					title: 'Тестовый заголовок',
					description: 'Тестовое описание',
				},
			})

			expect(screen.getByText('Тестовый заголовок')).toBeInTheDocument()
			expect(screen.getByText('Тестовое описание')).toBeInTheDocument()
		})
	})

	describe('пропс type', () => {
		const types = ['info', 'success', 'warning', 'error'] as const

		types.forEach(type => {
			it(`должен применять класс модификатора --${type}`, () => {
				const { container } = render(BaseAlert, { props: { type } })

				expect(container.querySelector('.base-alert')?.classList.contains(`base-alert--${type}`)).toBe(true)
			})
		})
	})

	describe('иконка', () => {
		it('должен рендерить кастомную иконку из пропса icon', () => {
			const { container } = render(BaseAlert, {
				props: { icon: 'custom-star' },
			})

			expect(container.querySelector('use')?.getAttribute('href')).toBe('icons.svg#custom-star')
		})

		const defaultIcons = {
			info: 'info',
			success: 'check-circle',
			warning: 'alert-triangle',
			error: 'x-circle',
		} as const

		Object.entries(defaultIcons).forEach(([type, iconName]) => {
			it(`должен рендерить иконку ${iconName} для типа ${type}`, () => {
				const { container } = render(BaseAlert, {
					props: { type: type as any },
				})

				expect(container.querySelector('use')?.getAttribute('href')).toBe(`icons.svg#${iconName}`)
			})
		})

		it('должен рендерить иконку info для неизвестного типа', () => {
			const { container } = render(BaseAlert, {
				props: { type: 'unknown' as any },
			})

			expect(container.querySelector('use')?.getAttribute('href')).toBe('icons.svg#info')
		})
	})

	describe('пропс variant', () => {
		const variants = ['ghost', 'outline', 'shadow', 'soft'] as const

		variants.forEach(variant => {
			it(`должен применять класс модификатора --${variant}`, () => {
				const { container } = render(BaseAlert, { props: { variant } })

				expect(container.querySelector('.base-alert')?.classList.contains(`base-alert--${variant}`)).toBe(true)
			})
		})

		it('не должен добавлять модификатор для варианта default', () => {
			const { container } = render(BaseAlert)

			expect(container.querySelector('.base-alert')?.classList.contains('base-alert--default')).toBe(false)
		})
	})

	describe('кнопка закрытия', () => {
		it('не должен рендерить кнопку закрытия по умолчанию', () => {
			const { container } = render(BaseAlert)

			expect(container.querySelector('.base-alert__close')).not.toBeInTheDocument()
		})

		it('должен рендерить кнопку закрытия при isClosable=true', () => {
			const { container } = render(BaseAlert, { props: { isClosable: true } })

			expect(container.querySelector('.base-alert__close')).toBeInTheDocument()
		})

		it('должен эмитить close при клике на кнопку закрытия', async () => {
			const { emitted, container } = render(BaseAlert, { props: { isClosable: true } })

			const closeButton = container.querySelector('.base-alert__close') as HTMLElement
			closeButton.dispatchEvent(new Event('click'))

			expect(emitted()).toHaveProperty('close')
		})
	})

	describe('слоты', () => {
		it('должен рендерить контент в дефолтном слоте', () => {
			render(BaseAlert, {
				slots: {
					default: '<span>Кастомное описание</span>',
				},
			})

			expect(screen.getByText('Кастомное описание')).toBeInTheDocument()
		})

		it('должен рендерить контент в слоте icon', () => {
			render(BaseAlert, {
				slots: {
					icon: '<span data-testid="custom-icon">Иконка</span>',
				},
			})

			expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
		})

		it('должен рендерить контент в слоте actions', () => {
			render(BaseAlert, {
				slots: {
					actions: '<button data-testid="custom-action">Действие</button>',
				},
			})

			expect(screen.getByTestId('custom-action')).toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseAlert, {
				props: { customClass: 'my-custom-alert' },
			})

			expect(container.querySelector('.base-alert')?.classList.contains('my-custom-alert')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseAlert, {
				props: {
					title: 'Заголовок',
					description: 'Описание',
					isClosable: true,
					customClass: {
						root: 'my-alert-root',
						title: 'my-alert-title',
						description: 'my-alert-desc',
						close: 'my-alert-close',
					},
				},
			})

			expect(container.querySelector('.base-alert')?.classList.contains('my-alert-root')).toBe(true)
			expect(container.querySelector('.base-alert__title')?.classList.contains('my-alert-title')).toBe(true)
			expect(container.querySelector('.base-alert__description')?.classList.contains('my-alert-desc')).toBe(true)
			expect(container.querySelector('.base-alert__close')?.classList.contains('my-alert-close')).toBe(true)
		})
	})
})
