/**
 * Unit-тесты для BaseRating.
 * Проверяют рендер звёзд, дробную заливку, выбор по шагу, emits, клавиатуру и a11y.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import BaseRating from './BaseRating.vue'

/** Зафиксировать геометрию звезды для предсказуемого расчёта позиции клика */
function mockStarRect(star: HTMLElement, width = 20): void {
	vi.spyOn(star, 'getBoundingClientRect').mockReturnValue({
		left: 0,
		width,
		top: 0,
		right: width,
		bottom: 0,
		height: 0,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	} as DOMRect)
}

function getStars(container: ParentNode): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>('.base-rating__star'))
}

function fillWidth(star: HTMLElement): string {
	return star.querySelector<HTMLElement>('.base-rating__star-fill')!.style.width
}

describe('BaseRating unit', () => {
	describe('рендер', () => {
		it('должен рендерить 5 звёзд по умолчанию', () => {
			const { container } = render(BaseRating)

			expect(getStars(container)).toHaveLength(5)
		})

		it('должен рендерить заданное количество звёзд из max', () => {
			const { container } = render(BaseRating, { props: { max: 10 } })

			expect(getStars(container)).toHaveLength(10)
		})

		it('должен применять класс варианта', () => {
			const { container } = render(BaseRating, { props: { variant: 'soft' } })

			expect(container.querySelector('.base-rating')).toHaveClass('base-rating--soft')
		})
	})

	describe('дробная заливка', () => {
		it('должен полностью заливать звёзды ниже целого значения', () => {
			const { container } = render(BaseRating, { props: { modelValue: 3 } })

			const stars = getStars(container)
			expect(fillWidth(stars[0])).toBe('100%')
			expect(fillWidth(stars[2])).toBe('100%')
			expect(fillWidth(stars[3])).toBe('0%')
		})

		it('должен частично заливать звезду для дробного значения', () => {
			const { container } = render(BaseRating, { props: { modelValue: 3.3 } })

			const stars = getStars(container)
			expect(fillWidth(stars[2])).toBe('100%')
			expect(fillWidth(stars[3])).toBe('30%')
		})

		it('не должен заливать ничего при modelValue=0', () => {
			const { container } = render(BaseRating, { props: { modelValue: 0 } })

			expect(getStars(container).every(s => fillWidth(s) === '0%')).toBe(true)
		})

		it('должен заливать все звёзды при modelValue равном max', () => {
			const { container } = render(BaseRating, { props: { modelValue: 5, max: 5 } })

			expect(getStars(container).every(s => fillWidth(s) === '100%')).toBe(true)
		})
	})

	describe('точечный выбор по клику (isHoverSmooth по умолчанию)', () => {
		it('должен фиксировать точное значение позиции при step=1', async () => {
			const { container, emitted } = render(BaseRating, { props: { step: 1 } })

			const star = getStars(container)[2]
			mockStarRect(star)
			await fireEvent.click(star, { clientX: 13 })

			expect(emitted()['update:modelValue']).toEqual([[2.65]])
			expect(emitted().change).toEqual([[2.65]])
		})

		it('должен фиксировать точную позицию совпадающую с предпросмотром hover', async () => {
			const { container, emitted } = render(BaseRating, { props: { step: 1 } })

			const star = getStars(container)[3]
			mockStarRect(star)
			await fireEvent.mouseMove(star, { clientX: 5 })
			const hoverFill = fillWidth(star)
			await fireEvent.click(star, { clientX: 5 })

			expect(hoverFill).toBe('25%')
			expect(emitted()['update:modelValue']).toEqual([[3.25]])
		})
	})

	describe('выбор по клику с шагом (isHoverSmooth=false)', () => {
		it('должен выбирать целое значение при step=1 по клику', async () => {
			const { container, emitted } = render(BaseRating, { props: { step: 1, isHoverSmooth: false } })

			const star = getStars(container)[2]
			mockStarRect(star)
			await fireEvent.click(star, { clientX: 18 })

			expect(emitted()['update:modelValue']).toEqual([[3]])
			expect(emitted().change).toEqual([[3]])
		})

		it('должен выбирать половину при step=0.5 по клику в левую половину', async () => {
			const { container, emitted } = render(BaseRating, { props: { step: 0.5, isHoverSmooth: false } })

			const star = getStars(container)[2]
			mockStarRect(star)
			await fireEvent.click(star, { clientX: 4 })

			expect(emitted()['update:modelValue']).toEqual([[2.5]])
		})

		it('должен выбирать десятые при step=0.1 по клику', async () => {
			const { container, emitted } = render(BaseRating, { props: { step: 0.1, isHoverSmooth: false } })

			const star = getStars(container)[3]
			mockStarRect(star)
			await fireEvent.click(star, { clientX: 6 })

			expect(emitted()['update:modelValue']).toEqual([[3.3]])
		})

		it('должен использовать полную звезду при нулевой ширине геометрии', async () => {
			const { container, emitted } = render(BaseRating, { props: { step: 1, isHoverSmooth: false } })

			await fireEvent.click(getStars(container)[1])

			expect(emitted()['update:modelValue']).toEqual([[2]])
		})
	})

	describe('блокировка выбора', () => {
		it('не должен эмитить при isReadonly=true', async () => {
			const { container, emitted } = render(BaseRating, { props: { isReadonly: true } })

			await fireEvent.click(getStars(container)[1])

			expect(emitted()['update:modelValue']).toBeUndefined()
		})

		it('не должен эмитить при isDisabled=true', async () => {
			const { container, emitted } = render(BaseRating, { props: { isDisabled: true } })

			await fireEvent.click(getStars(container)[1])

			expect(emitted()['update:modelValue']).toBeUndefined()
		})
	})

	describe('клавиатура', () => {
		it('должен увеличивать на шаг по ArrowRight', async () => {
			const { container, emitted } = render(BaseRating, { props: { modelValue: 2, step: 0.5 } })

			await fireEvent.keyDown(container.querySelector('.base-rating')!, { key: 'ArrowRight' })

			expect(emitted()['update:modelValue']).toEqual([[2.5]])
		})

		it('должен уменьшать на шаг по ArrowLeft', async () => {
			const { container, emitted } = render(BaseRating, { props: { modelValue: 2, step: 0.5 } })

			await fireEvent.keyDown(container.querySelector('.base-rating')!, { key: 'ArrowLeft' })

			expect(emitted()['update:modelValue']).toEqual([[1.5]])
		})

		it('должен увеличивать по ArrowUp', async () => {
			const { container, emitted } = render(BaseRating, { props: { modelValue: 2 } })

			await fireEvent.keyDown(container.querySelector('.base-rating')!, { key: 'ArrowUp' })

			expect(emitted()['update:modelValue']).toEqual([[3]])
		})

		it('должен уменьшать по ArrowDown', async () => {
			const { container, emitted } = render(BaseRating, { props: { modelValue: 2 } })

			await fireEvent.keyDown(container.querySelector('.base-rating')!, { key: 'ArrowDown' })

			expect(emitted()['update:modelValue']).toEqual([[1]])
		})

		it('не должен опускаться ниже 0', async () => {
			const { container, emitted } = render(BaseRating, { props: { modelValue: 0 } })

			await fireEvent.keyDown(container.querySelector('.base-rating')!, { key: 'ArrowLeft' })

			expect(emitted()['update:modelValue']).toEqual([[0]])
		})

		it('не должен превышать max', async () => {
			const { container, emitted } = render(BaseRating, { props: { modelValue: 5, max: 5 } })

			await fireEvent.keyDown(container.querySelector('.base-rating')!, { key: 'ArrowRight' })

			expect(emitted()['update:modelValue']).toEqual([[5]])
		})

		it('должен игнорировать клавиши кроме стрелок', async () => {
			const { container, emitted } = render(BaseRating, { props: { modelValue: 2 } })

			await fireEvent.keyDown(container.querySelector('.base-rating')!, { key: 'Enter' })

			expect(emitted()['update:modelValue']).toBeUndefined()
		})

		it('не должен реагировать на клавиши при isReadonly=true', async () => {
			const { container, emitted } = render(BaseRating, { props: { modelValue: 2, isReadonly: true } })

			await fireEvent.keyDown(container.querySelector('.base-rating')!, { key: 'ArrowRight' })

			expect(emitted()['update:modelValue']).toBeUndefined()
		})
	})

	describe('наведение', () => {
		it('должен плавно следовать за курсором по умолчанию (isHoverSmooth)', async () => {
			const { container } = render(BaseRating, { props: { modelValue: 0, step: 1 } })

			const star = getStars(container)[3]
			mockStarRect(star)
			await fireEvent.mouseMove(star, { clientX: 5 })

			expect(fillWidth(star)).toBe('25%')
		})

		it('должен давать непрерывную заливку при step=1 и наведении в середину', async () => {
			const { container } = render(BaseRating, { props: { modelValue: 0, step: 1 } })

			const star = getStars(container)[2]
			mockStarRect(star)
			await fireEvent.mouseMove(star, { clientX: 13 })

			expect(fillWidth(star)).toBe('65%')
		})

		it('должен привязывать предпросмотр к шагу при isHoverSmooth=false', async () => {
			const { container } = render(BaseRating, {
				props: { modelValue: 0, step: 0.5, isHoverSmooth: false },
			})

			const star = getStars(container)[3]
			mockStarRect(star)
			await fireEvent.mouseMove(star, { clientX: 4 })

			expect(fillWidth(star)).toBe('50%')
		})

		it('должен сбрасывать предпросмотр при уходе курсора', async () => {
			const { container } = render(BaseRating, { props: { modelValue: 1 } })

			const star = getStars(container)[3]
			mockStarRect(star)
			await fireEvent.mouseMove(star, { clientX: 18 })
			await fireEvent.mouseLeave(container.querySelector('.base-rating')!)

			expect(fillWidth(star)).toBe('0%')
		})

		it('не должен показывать предпросмотр при isReadonly=true', async () => {
			const { container } = render(BaseRating, { props: { modelValue: 1, isReadonly: true } })

			const star = getStars(container)[3]
			mockStarRect(star)
			await fireEvent.mouseMove(star, { clientX: 18 })

			expect(fillWidth(star)).toBe('0%')
		})
	})

	describe('доступность', () => {
		it('должен иметь role="slider" с метками диапазона и значения', () => {
			render(BaseRating, { props: { max: 5, modelValue: 3 } })

			const slider = screen.getByRole('slider')
			expect(slider).toHaveAttribute('aria-label', 'Оценка от 0 до 5')
			expect(slider).toHaveAttribute('aria-valuemin', '0')
			expect(slider).toHaveAttribute('aria-valuemax', '5')
			expect(slider).toHaveAttribute('aria-valuenow', '3')
		})

		it('должен убирать слайдер из таб-порядка при isReadonly', () => {
			render(BaseRating, { props: { isReadonly: true } })

			expect(screen.getByRole('slider')).toHaveAttribute('tabindex', '-1')
		})
	})

	describe('пропс variant', () => {
		const variants = ['ghost', 'outline', 'shadow', 'soft'] as const

		variants.forEach(variant => {
			it(`должен применять модификатор --${variant}`, () => {
				const { container } = render(BaseRating, { props: { variant } })

				expect(container.querySelector('.base-rating')).toHaveClass(`base-rating--${variant}`)
			})
		})

		it('не должен добавлять модификатор для варианта default', () => {
			const { container } = render(BaseRating)

			expect(container.querySelector('.base-rating')).not.toHaveClass('base-rating--default')
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseRating)

			const root = container.querySelector('.base-rating') as HTMLElement
			expect(root.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseRating, { props: { sizeScale: 150 } })

			const root = container.querySelector('.base-rating') as HTMLElement
			expect(root.style.getPropertyValue('--size-scale')).toBe('1.5')
		})
	})

	describe('пропс icon', () => {
		it('должен использовать иконку star по умолчанию', () => {
			const { container } = render(BaseRating)

			expect(container.querySelector('use')?.getAttribute('href')).toContain('star')
		})

		it('должен использовать кастомную иконку для всех звёзд', () => {
			const { container } = render(BaseRating, { props: { icon: 'heart' } })

			const hrefs = Array.from(container.querySelectorAll('use')).map(u => u.getAttribute('href') ?? '')
			expect(hrefs.every(href => href.includes('heart'))).toBe(true)
		})
	})

	describe('пропс iconFilled', () => {
		it('должен использовать icon для заполненного слоя по умолчанию', () => {
			const { container } = render(BaseRating, { props: { icon: 'heart', modelValue: 1 } })

			const fillIcon = container.querySelector('.base-rating__star-fill use')
			expect(fillIcon?.getAttribute('href')).toContain('heart')
		})

		it('должен использовать отдельную иконку для заполненного состояния', () => {
			const { container } = render(BaseRating, {
				props: { icon: 'star', iconFilled: 'check', modelValue: 1 },
			})

			const star = container.querySelector('.base-rating__star')!
			const emptyIcon = star.querySelector(':scope > .base-icon use')
			const fillIcon = star.querySelector('.base-rating__star-fill use')
			expect(emptyIcon?.getAttribute('href')).toContain('star')
			expect(fillIcon?.getAttribute('href')).toContain('check')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseRating, { props: { customClass: 'my-rating' } })

			expect(container.querySelector('.base-rating')).toHaveClass('my-rating')
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseRating, {
				props: { customClass: { root: 'my-root', icon: 'my-icon' } },
			})

			expect(container.querySelector('.base-rating')).toHaveClass('my-root')
			expect(container.querySelector('.my-icon')).not.toBeNull()
		})
	})

	describe('пропс color', () => {
		it('должен применять кастомный цвет текста заливки', () => {
			const { container } = render(BaseRating, {
				props: { color: { text: { base: '#ff0000' } } },
			})

			const root = container.querySelector('.base-rating') as HTMLElement
			expect(root.getAttribute('style')).toContain('#ff0000')
		})
	})

	describe('emit change', () => {
		it('должен эмитить change вместе с update:modelValue при выборе с клавиатуры', async () => {
			const { container, emitted } = render(BaseRating, { props: { modelValue: 2 } })

			await fireEvent.keyDown(container.querySelector('.base-rating')!, { key: 'ArrowRight' })

			expect(emitted().change).toEqual([[3]])
			expect(emitted()['update:modelValue']).toEqual([[3]])
		})
	})
})
