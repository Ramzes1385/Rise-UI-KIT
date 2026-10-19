import '@testing-library/jest-dom/vitest'
import { screen } from '@testing-library/vue'
import { renderRoadmap } from '../fixtures/renderRoadmap'
import type { RoadmapLayout } from '../../types/BaseRoadmap.types'

const PATH_SIDE_MIN = 816 + 64 + 401

describe('BaseRoadmap: панель auto по ширине раскладки', () => {
	it.each([
		{ layout: 'list', width: 901, mode: 'side' },
		{ layout: 'list', width: 900, mode: 'sheet' },
		{ layout: 'horizontal', width: 901, mode: 'side' },
		{ layout: 'horizontal', width: 900, mode: 'sheet' },
		{ layout: 'path', width: PATH_SIDE_MIN + 1, mode: 'side' },
		{ layout: 'path', width: PATH_SIDE_MIN, mode: 'sheet' },
		{ layout: 'path', width: 1000, mode: 'sheet' },
	] as { layout: RoadmapLayout; width: number; mode: string }[])('$layout при $width px — $mode', async ({ layout, width, mode }) => {
		await renderRoadmap({ width, props: { layout, narrowLayout: null, selected: 'html' } })
		if (mode === 'side') {
			expect(screen.getByRole('complementary', { name: 'Подробности темы' })).toBeInTheDocument()
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		} else {
			expect(await screen.findByRole('dialog')).toBeInTheDocument()
			expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
		}
	})

	it('порог «Пути» растёт с sizeScale', async () => {
		await renderRoadmap({ width: PATH_SIDE_MIN + 100, props: { layout: 'path', narrowLayout: null, sizeScale: 125, selected: 'html' } })
		expect(await screen.findByRole('dialog')).toBeInTheDocument()
	})

	it('явное detailsPosition: side не зависит от ширины раскладки', async () => {
		await renderRoadmap({ width: 1000, props: { layout: 'path', narrowLayout: null, detailsPosition: 'side', selected: 'html' } })
		expect(screen.getByRole('complementary', { name: 'Подробности темы' })).toBeInTheDocument()
	})
})

describe('BaseRoadmap: закрытый этап в раскладках', () => {
	it.each([{ layout: 'list' }, { layout: 'path' }, { layout: 'snake' }, { layout: 'horizontal' }] as { layout: RoadmapLayout }[])(
		'$layout: скринридер читает «закрыт» и «Откроется после»',
		async ({ layout }) => {
			await renderRoadmap({ width: 1600, props: { layout, narrowLayout: null } })
			const stage = screen.getByRole('button', { name: /Фреймворки/ })
			expect(stage).toHaveAccessibleName(/закрыт.*Откроется после «CSS»/)
		},
	)

	it('«Список»: закрытый этап статичен', async () => {
		const { user, emitted } = await renderRoadmap({ props: { layout: 'list' } })
		const stage = screen.getByRole('button', { name: /Фреймворки/ })
		expect(stage).toHaveAttribute('aria-disabled', 'true')
		expect(stage).not.toHaveAttribute('aria-expanded')
		await user.click(stage)
		expect(emitted()['update:expanded']).toBeUndefined()
	})

	it.each([{ layout: 'path' }, { layout: 'snake' }, { layout: 'horizontal' }] as { layout: RoadmapLayout }[])(
		'$layout: закрытый этап раскрывается',
		async ({ layout }) => {
			const { user, emitted } = await renderRoadmap({ width: 1600, props: { layout, narrowLayout: null } })
			const stage = screen.getByRole('button', { name: /Фреймворки/ })
			expect(stage).toHaveAttribute('aria-expanded', 'false')
			await user.click(stage)
			expect(emitted()['update:expanded']).toBeDefined()
			expect(screen.getByRole('button', { name: /Фреймворки/ })).toHaveAttribute('aria-expanded', 'true')
		},
	)
})
