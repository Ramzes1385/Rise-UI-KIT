import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import { createUiKitPlugin } from '@/plugin'
import BaseRoadmap from '../ui/BaseRoadmap.vue'
import { renderRoadmap } from './fixtures/renderRoadmap'
import { render, screen, waitFor } from '@testing-library/vue'
import { SHELL_DATA, mockWidth } from './fixtures/shellFixtures'

describe('BaseRoadmap integration', () => {
	it('isLoading ставит aria-busy', () => {
		render(BaseRoadmap, { props: { data: { version: 1, title: 'Пример', stages: [] }, isLoading: true } })
		expect(screen.getByRole('region', { name: 'Пример' })).toHaveAttribute('aria-busy', 'true')
	})

	describe('defaults плагина', () => {
		function renderWithDefaults(defaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
			mockWidth(1200)
			return render(BaseRoadmap, {
				props: { data: SHELL_DATA, ...props },
				global: { plugins: [createUiKitPlugin({ defaults: { BaseRoadmap: defaults } })] },
			})
		}

		it('hasSummary, hasFilter и hasLayoutSwitch берутся из defaults', () => {
			renderWithDefaults({ hasSummary: false, hasFilter: false, hasLayoutSwitch: false })
			expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
			expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
		})

		it('layout и narrowWidth из defaults, явный проп важнее', async () => {
			const first = renderWithDefaults({ layout: 'snake' })
			expect(first.container.querySelector('.base-roadmap__area--snake')).not.toBeNull()
			first.unmount()
			const second = renderWithDefaults({ layout: 'snake' }, { layout: 'list' })
			expect(second.container.querySelector('.base-roadmap__area--list')).not.toBeNull()
			second.unmount()
			const third = renderWithDefaults({ narrowWidth: 2000 })
			await waitFor(() => expect(third.container.querySelector('.base-roadmap--narrow')).not.toBeNull())
		})

		it('detailsPosition из defaults', async () => {
			renderWithDefaults({ detailsPosition: 'sheet' }, { layout: 'list', selected: 'html' })
			expect(await screen.findByRole('dialog', { name: 'HTML' })).toBeInTheDocument()
		})

		it('ui из defaults добавляет классы частей', () => {
			const { container } = renderWithDefaults({ ui: { header: 'app-header' } })
			expect(container.querySelector('.base-roadmap__header')).toHaveClass('app-header')
		})

		it('без defaults работают умолчания компонента', () => {
			mockWidth(1200)
			const { container } = render(BaseRoadmap, { props: { data: SHELL_DATA }, global: { plugins: [createUiKitPlugin()] } })
			expect(container.querySelector('.base-roadmap__area--path')).not.toBeNull()
			expect(screen.getByRole('progressbar', { name: 'Прогресс пути' })).toBeInTheDocument()
		})
	})

	describe('методы через ref', () => {
		function mountRoadmap() {
			mockWidth(1200)
			return mount(BaseRoadmap, { props: { data: SHELL_DATA, layout: 'list' }, attachTo: document.body })
		}

		it('setTopicStatus и getTopicState', async () => {
			const wrapper = mountRoadmap()
			expect(await wrapper.vm.setTopicStatus('html', 'done')).toBe(true)
			expect(wrapper.vm.getTopicState('html')?.status).toBe('done')
			expect(wrapper.vm.getTopicState('css')?.status).toBe('available')
			expect(wrapper.vm.getTopicState('nope')).toBeNull()
			expect(await wrapper.vm.setTopicStatus('css', null)).toBe(false)
			wrapper.unmount()
		})

		it('toggleSubtopic и resetProgress', async () => {
			const wrapper = mountRoadmap()
			expect(await wrapper.vm.toggleSubtopic('html', 'tags', true)).toBe(true)
			expect(wrapper.vm.getTopicState('html')?.status).toBe('in-progress')
			wrapper.vm.resetProgress()
			expect(wrapper.vm.getTopicState('html')?.status).toBe('available')
			wrapper.unmount()
		})

		it('expandStage, expandAll, collapseAll, selectTopic и continueLearning', async () => {
			const wrapper = mountRoadmap()
			wrapper.vm.collapseAll()
			await wrapper.vm.$nextTick()
			expect(screen.queryByRole('button', { name: /^HTML/ })).not.toBeInTheDocument()
			wrapper.vm.expandStage('basics')
			await wrapper.vm.$nextTick()
			expect(screen.getByRole('button', { name: /^HTML/ })).toBeInTheDocument()
			wrapper.vm.collapseAll()
			wrapper.vm.expandAll()
			wrapper.vm.selectTopic('css')
			await wrapper.vm.$nextTick()
			expect(screen.getByRole('heading', { name: 'CSS', level: 2 })).toBeInTheDocument()
			wrapper.vm.selectTopic(null)
			wrapper.vm.collapseAll()
			wrapper.vm.continueLearning()
			await wrapper.vm.$nextTick()
			expect(screen.getByRole('heading', { name: 'HTML', level: 2 })).toBeInTheDocument()
			wrapper.unmount()
		})
	})

	it('data можно заменить: список и сводка перестраиваются', async () => {
		const { rerender } = await renderRoadmap()
		expect(screen.getByText('0 из 5 тем')).toBeInTheDocument()
		await rerender({
			data: { version: 1, title: 'Новый', stages: [{ id: 'n', title: 'Один', topics: [{ id: 'n1', title: 'Тема' }] }] },
		})
		expect(screen.getByRole('heading', { name: 'Новый', level: 2 })).toBeInTheDocument()
		expect(screen.getByText('0 из 1 темы')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /^Тема/ })).toBeInTheDocument()
	})
})
