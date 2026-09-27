/**
 * Unit-тесты для BaseEmpty.
 * Проверяют рендер, пропсы, слоты и кастомные стили.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseEmpty from '../ui/BaseEmpty.vue'

/** Исходник стилей компонента: jsdom не вычисляет calc()/var(), формулы считаются в тесте */
// Путь строится через node:path: в jsdom-окружении глобальный URL — реализация jsdom, и fs не принимает такой объект
const STYLES = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../styles/BaseEmpty.style.scss'), 'utf-8')

/**
 * Значения в px из объявления `sz(32px 24px)` так же, как их считает браузер: sz() из src/styles/_functions.scss
 * раскрывает каждое значение в calc(X * var(--size-scale, 1)), а --size-scale — коэффициент (1.5 = 150%),
 * который компонент выставил на корне. Пустая строка — переменная не задана, действует fallback 1.
 */
function resolvePx(declaration: string, sizeScale: string): number[] {
	const values = declaration.match(/^sz\(([^)]+)\)$/)?.[1]
	if (!values) throw new Error(`Ожидалось значение через sz(): ${declaration}`)
	const factor = sizeScale === '' ? 1 : Number(sizeScale)
	return values.trim().split(/\s+/).map(value => Number.parseFloat(value) * factor)
}

/** Объявление свойства в корневом блоке .base-empty (строки с одним отступом табуляцией, без вложенных блоков) */
function rootDeclaration(property: string): string {
	const match = STYLES.match(new RegExp(`\\n\\t${property}:\\s*([^;]+);`))
	if (!match?.[1]) throw new Error(`Свойство ${property} не найдено в корне .base-empty`)
	return match[1]
}

describe('BaseEmpty unit', () => {
	describe('масштабирование отступов (sizeScale)', () => {
		function renderedSizeScale(sizeScale: number): string {
			const { container } = render(BaseEmpty, { props: { sizeScale, title: 'Пусто' } })
			return (container.querySelector('.base-empty') as HTMLElement).style.getPropertyValue('--size-scale')
		}

		it('должен пропорционально увеличивать внутренний отступ при sizeScale=150', () => {
			expect(resolvePx(rootDeclaration('padding'), renderedSizeScale(150))).toEqual([48, 36])
		})

		it('должен пропорционально уменьшать промежутки между иконкой, текстом и действиями при sizeScale=75', () => {
			expect(resolvePx(rootDeclaration('gap'), renderedSizeScale(75))).toEqual([12])
		})

		it('должен сохранять базовый отступ 32px 24px при sizeScale=100', () => {
			expect(resolvePx(rootDeclaration('padding'), renderedSizeScale(100))).toEqual([32, 24])
		})
	})

	describe('рендер', () => {
		it('должен рендерить пустое состояние', () => {
			const { container } = render(BaseEmpty)

			expect(container.querySelector('.base-empty')).toBeInTheDocument()
		})

		it('должен рендерить заголовок и описание', () => {
			render(BaseEmpty, {
				props: {
					title: 'Нет данных',
					description: 'Попробуйте изменить параметры фильтрации',
				},
			})

			expect(screen.getByText('Нет данных')).toBeInTheDocument()
			expect(screen.getByText('Попробуйте изменить параметры фильтрации')).toBeInTheDocument()
		})
	})

	describe('пропс icon', () => {
		it('должен показывать иконку inbox по умолчанию', () => {
			const { container } = render(BaseEmpty, { props: { title: 'Пусто' } })

			expect(container.querySelector('use')?.getAttribute('href')).toBe('icons.svg#inbox')
		})

		it('должен показывать иконку из пропа icon', () => {
			const { container } = render(BaseEmpty, { props: { title: 'Ничего не найдено', icon: 'search' } })

			expect(container.querySelector('use')?.getAttribute('href')).toBe('icons.svg#search')
		})
	})

	describe('пропс variant', () => {
		const variants = ['ghost', 'soft'] as const

		variants.forEach(variant => {
			it(`должен применять класс модификатора --${variant}`, () => {
				const { container } = render(BaseEmpty, { props: { variant } })

				expect(container.querySelector('.base-empty')?.classList.contains(`base-empty--${variant}`)).toBe(true)
			})
		})

		it('не должен добавлять модификатор для варианта default', () => {
			const { container } = render(BaseEmpty)

			expect(container.querySelector('.base-empty')?.classList.contains('base-empty--default')).toBe(false)
		})
	})

	describe('слоты', () => {
		it('должен рендерить контент в дефолтном слоте', () => {
			render(BaseEmpty, {
				slots: {
					default: '<span>Дополнительный контент</span>',
				},
			})

			expect(screen.getByText('Дополнительный контент')).toBeInTheDocument()
		})

		it('должен рендерить контент в слоте icon', () => {
			render(BaseEmpty, {
				slots: {
					icon: '<span data-testid="custom-icon">Иконка</span>',
				},
			})

			expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
		})

		it('должен рендерить контент в слоте actions', () => {
			render(BaseEmpty, {
				slots: {
					actions: '<button data-testid="custom-action">Сбросить фильтры</button>',
				},
			})

			expect(screen.getByTestId('custom-action')).toBeInTheDocument()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseEmpty, {
				props: { customClass: 'my-custom-empty' },
			})

			expect(container.querySelector('.base-empty')?.classList.contains('my-custom-empty')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseEmpty, {
				props: {
					title: 'Заголовок',
					description: 'Описание',
					customClass: {
						root: 'my-empty-root',
						title: 'my-empty-title',
						description: 'my-empty-desc',
					},
				},
			})

			expect(container.querySelector('.base-empty')?.classList.contains('my-empty-root')).toBe(true)
			expect(container.querySelector('.base-empty__title')?.classList.contains('my-empty-title')).toBe(true)
			expect(container.querySelector('.base-empty__description')?.classList.contains('my-empty-desc')).toBe(true)
		})
	})
})
