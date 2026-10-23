import '@testing-library/jest-dom/vitest'
import BaseRoadmap from '../ui/BaseRoadmap.vue'
import { render, screen } from '@testing-library/vue'
import type { RoadmapData } from '../types/roadmapData.types'
import { SHELL_DATA, mockWidth } from './fixtures/shellFixtures'

const data: RoadmapData = { version: 1, title: 'Пример', stages: [] }

describe('BaseRoadmap unit', () => {
	it('рендерит область с подписью из data.title', () => {
		render(BaseRoadmap, { props: { data } })
		expect(screen.getByRole('region', { name: 'Пример' })).toBeInTheDocument()
	})

	it('слот empty показывается без этапов', () => {
		render(BaseRoadmap, { props: { data }, slots: { empty: 'Пусто' } })
		expect(screen.getByText('Пусто')).toBeInTheDocument()
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseRoadmap, { props: { data, variant: 'outline' } })
		expect(container.querySelector('.base-roadmap')).toHaveClass('base-roadmap--outline')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseRoadmap, { props: { data, sizeScale: 125 } })
		expect((container.querySelector('.base-roadmap') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseRoadmap, { props: { data, customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-roadmap')).toHaveClass('my-root')
	})

	it('вариант по умолчанию и масштаб 100 не добавляют лишнего', () => {
		const { container } = render(BaseRoadmap, { props: { data } })
		const root = container.querySelector('.base-roadmap') as HTMLElement
		expect(root.className).toBe('base-roadmap')
		expect(root.style.getPropertyValue('--size-scale')).toBe('')
	})

	it('ariaLabel важнее заголовка', () => {
		render(BaseRoadmap, { props: { data, ariaLabel: 'Моя карта' } })
		expect(screen.getByRole('region', { name: 'Моя карта' })).toBeInTheDocument()
	})

	it('заголовок и подзаголовок: описание или число этапов и тем', () => {
		const first = render(BaseRoadmap, { props: { data: SHELL_DATA } })
		expect(screen.getByRole('heading', { name: 'Фронтенд', level: 2 })).toBeInTheDocument()
		expect(screen.getByText('2 этапа · 5 тем')).toBeInTheDocument()
		first.unmount()
		render(BaseRoadmap, { props: { data: { ...SHELL_DATA, description: 'Свой подзаголовок' } } })
		expect(screen.getByText('Свой подзаголовок')).toBeInTheDocument()
		expect(screen.queryByText('2 этапа · 5 тем')).not.toBeInTheDocument()
	})

	it('без этапов нет сводки, панели управления и подзаголовка с числами', () => {
		render(BaseRoadmap, { props: { data } })
		expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
		expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
		expect(screen.getByText('В пути пока нет этапов')).toBeInTheDocument()
	})

	it('hasSummary: false убирает сводку', () => {
		render(BaseRoadmap, { props: { data: SHELL_DATA, hasSummary: false } })
		expect(screen.queryByRole('progressbar', { name: 'Прогресс пути' })).not.toBeInTheDocument()
		expect(screen.queryByRole('button', { name: /Продолжить/ })).not.toBeInTheDocument()
	})

	it('isLoading показывает заглушки вместо содержимого', () => {
		const { container } = render(BaseRoadmap, { props: { data: SHELL_DATA, isLoading: true } })
		expect(screen.getByRole('group', { name: 'Загрузка пути' })).toBeInTheDocument()
		expect(container.querySelectorAll('.base-skeleton').length).toBe(5)
		expect(screen.queryByText('HTML')).not.toBeInTheDocument()
	})

	it('ui подставляет классы частей', () => {
		mockWidth(1200)
		const { container } = render(BaseRoadmap, {
			props: {
				data: SHELL_DATA,
				layout: 'list',
				ui: { header: 'my-header', summary: 'my-summary', filter: 'my-filter', layout: 'my-layout' },
			},
		})
		expect(container.querySelector('.base-roadmap__header')).toHaveClass('my-header')
		expect(container.querySelector('.base-roadmap__summary')).toHaveClass('my-summary')
		expect(container.querySelector('.base-roadmap__filter')).toHaveClass('my-filter')
		expect(container.querySelector('.base-roadmap__area .base-roadmap__layout')).toHaveClass('my-layout')
	})

	it('цель пути показывается в раскладке «Путь»', () => {
		mockWidth(1200)
		render(BaseRoadmap, { props: { data: SHELL_DATA, layout: 'path' } })
		expect(screen.getByText('Цель — Работа')).toBeInTheDocument()
	})
})
