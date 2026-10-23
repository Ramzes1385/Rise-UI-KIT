import '@testing-library/jest-dom/vitest'
import BaseCard from '../ui/BaseCard.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseCard unit', () => {
	describe('рендер', () => {
		it('должен рендерить карточку', () => {
			const { container } = render(BaseCard)

			expect(container.querySelector('.base-card')).toBeInTheDocument()
		})

		it('должен рендерить body с контентом слота', () => {
			const { container } = render(BaseCard, {
				slots: { default: '<p>Контент</p>' },
			})

			expect(container.querySelector('.base-card__body')).toBeInTheDocument()
			expect(screen.getByText('Контент')).toBeInTheDocument()
		})
	})

	describe('пропс title', () => {
		it('должен рендерить заголовок когда передан', () => {
			render(BaseCard, { props: { title: 'Заголовок' } })

			expect(screen.getByText('Заголовок')).toBeInTheDocument()
		})

		it('должен рендерить header когда есть title', () => {
			const { container } = render(BaseCard, { props: { title: 'Заголовок' } })

			expect(container.querySelector('.base-card__header')).toBeInTheDocument()
		})
	})

	describe('пропс subtitle', () => {
		it('должен рендерить подзаголовок когда передан', () => {
			render(BaseCard, { props: { subtitle: 'Описание' } })

			expect(screen.getByText('Описание')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять модификатор для варианта default', () => {
			const { container } = render(BaseCard)

			expect(container.querySelector('.base-card')?.classList.contains('base-card--default')).toBe(false)
		})

		it('должен применять модификатор --outline когда variant=outline', () => {
			const { container } = render(BaseCard, { props: { variant: 'outline' } })

			expect(container.querySelector('.base-card')?.classList.contains('base-card--outline')).toBe(true)
		})

		it('должен применять модификатор --ghost когда variant=ghost', () => {
			const { container } = render(BaseCard, { props: { variant: 'ghost' } })

			expect(container.querySelector('.base-card')?.classList.contains('base-card--ghost')).toBe(true)
		})
	})

	describe('пропс padding', () => {
		it('не должен выставлять inline-переменные без пропа: отступы берутся из стилей (16px 20px)', () => {
			const { container } = render(BaseCard, { props: { title: 'Отчёт' } })

			const card = container.querySelector('.base-card') as HTMLElement
			expect(card.style.getPropertyValue('--card-pad-top')).toBe('')
			expect(card.style.getPropertyValue('--card-pad-left')).toBe('')
		})

		it('должен выставлять отступы из числа: по вертикали n, по горизонтали 2n', () => {
			const { container } = render(BaseCard, { props: { padding: 8 } })

			const card = container.querySelector('.base-card') as HTMLElement
			expect(card.style.getPropertyValue('--card-pad-top')).toBe('8px')
			expect(card.style.getPropertyValue('--card-pad-left')).toBe('16px')
		})

		it('должен выставлять нулевые отступы при padding=0', () => {
			const { container } = render(BaseCard, { props: { padding: 0 } })

			const card = container.querySelector('.base-card') as HTMLElement
			expect(card.style.getPropertyValue('--card-pad-top')).toBe('0px')
			expect(card.style.getPropertyValue('--card-pad-right')).toBe('0px')
		})

		it('должен выставлять отступы из объекта: оси напрямую, стороны переопределяют оси', () => {
			const { container } = render(BaseCard, { props: { padding: { x: 32, y: 12, top: 4 } } })

			const card = container.querySelector('.base-card') as HTMLElement
			expect(card.style.getPropertyValue('--card-pad-top')).toBe('4px')
			expect(card.style.getPropertyValue('--card-pad-bottom')).toBe('12px')
			expect(card.style.getPropertyValue('--card-pad-left')).toBe('32px')
		})
	})

	describe('шапка', () => {
		it('не должен рендерить шапку без title, subtitle и слотов header/actions', () => {
			const { container } = render(BaseCard, { slots: { default: 'Контент' } })

			expect(container.querySelector('.base-card__header')).not.toBeInTheDocument()
		})

		it('должен рендерить шапку только с подзаголовком', () => {
			const { container } = render(BaseCard, { props: { subtitle: 'Обновлён 15 мая' } })

			expect(container.querySelector('.base-card__header')).toBeInTheDocument()
			expect(container.querySelector('.base-card__title')).not.toBeInTheDocument()
		})
	})

	describe('пропс height', () => {
		it('должен обрезать тело (модификатор --truncate) при height без scroll', () => {
			const { container } = render(BaseCard, { props: { height: '160px' } })

			const card = container.querySelector('.base-card') as HTMLElement
			expect(card).toHaveClass('base-card--truncate')
			expect(card.style.getPropertyValue('--card-height')).toBe('160px')
		})

		it('должен прокручивать тело (модификатор --scroll) вместо обрезки при scroll', () => {
			const { container } = render(BaseCard, { props: { height: '160px', scroll: true } })

			const card = container.querySelector('.base-card') as HTMLElement
			expect(card).toHaveClass('base-card--scroll')
			expect(card).not.toHaveClass('base-card--truncate')
		})
	})

	describe('пропс scroll', () => {
		it('должен делать прокручиваемое тело фокусируемым, чтобы его можно было прокрутить с клавиатуры', () => {
			const { container } = render(BaseCard, { props: { height: '200px', scroll: true } })

			expect(container.querySelector('.base-card__body')).toHaveAttribute('tabindex', '0')
		})

		it('не должен добавлять тело в порядок Tab без scroll', () => {
			const { container } = render(BaseCard, { props: { height: '200px' } })

			expect(container.querySelector('.base-card__body')).not.toHaveAttribute('tabindex')
		})
	})

	describe('пропс isHoverable', () => {
		it('должен добавлять класс --hoverable когда isHoverable=true', () => {
			const { container } = render(BaseCard, { props: { isHoverable: true } })

			expect(container.querySelector('.base-card')?.classList.contains('base-card--hoverable')).toBe(true)
		})

		it('не должен добавлять класс --hoverable по умолчанию', () => {
			const { container } = render(BaseCard)

			expect(container.querySelector('.base-card')?.classList.contains('base-card--hoverable')).toBe(false)
		})
	})

	describe('слоты', () => {
		it('должен рендерить footer-слот', () => {
			const { container } = render(BaseCard, {
				slots: { footer: '<button>Действие</button>' },
			})

			expect(container.querySelector('.base-card__footer')).toBeInTheDocument()
			expect(screen.getByText('Действие')).toBeInTheDocument()
		})

		it('подвал — не ориентир contentinfo: несколько карточек на странице не дают дублей ориентиров', () => {
			const { container } = render(BaseCard, {
				slots: { footer: '<button>Действие</button>' },
			})

			expect(container.querySelector('footer')).toBeNull()
			expect(container.querySelector('.base-card__footer')?.tagName).toBe('DIV')
		})

		it('не должен рендерить footer когда слот не передан', () => {
			const { container } = render(BaseCard)

			expect(container.querySelector('.base-card__footer')).not.toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseCard, {
				props: { customClass: 'custom-card-class' },
			})

			expect(container.querySelector('.base-card')).toHaveClass('custom-card-class')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseCard, {
				props: {
					title: 'Заголовок',
					subtitle: 'Подзаголовок',
					customClass: {
						root: 'custom-root',
						header: 'custom-header',
						title: 'custom-title',
						subtitle: 'custom-subtitle',
						actions: 'custom-actions',
						body: 'custom-body',
						footer: 'custom-footer',
					},
				},
				slots: {
					actions: '<button>Кнопка</button>',
					footer: '<p>Подвал</p>',
				},
			})

			expect(container.querySelector('.base-card')).toHaveClass('custom-root')
			expect(container.querySelector('.base-card__header')).toHaveClass('custom-header')
			expect(container.querySelector('.base-card__title')).toHaveClass('custom-title')
			expect(container.querySelector('.base-card__subtitle')).toHaveClass('custom-subtitle')
			expect(container.querySelector('.base-card__actions')).toHaveClass('custom-actions')
			expect(container.querySelector('.base-card__body')).toHaveClass('custom-body')
			expect(container.querySelector('.base-card__footer')).toHaveClass('custom-footer')
		})
	})
})
