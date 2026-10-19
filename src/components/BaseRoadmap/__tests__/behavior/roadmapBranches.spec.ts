import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseRoadmap from '../../ui/BaseRoadmap.vue'
import userEvent from '@testing-library/user-event'
import { screen, waitFor, within } from '@testing-library/vue'
import { SHELL_DATA, mockWidth } from '../fixtures/shellFixtures'
import type { BaseRoadmapExpose } from '../../types/BaseRoadmap.types'

function mountView(props: Record<string, unknown> = {}) {
	mockWidth(1200)
	const user = userEvent.setup()
	const wrapper = mount(BaseRoadmap, { props: { data: SHELL_DATA, layout: 'list', ...props } as never, attachTo: document.body })
	return { wrapper, user, api: wrapper.vm as unknown as BaseRoadmapExpose }
}

describe('BaseRoadmap: редкие пути просмотра', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('отказ обработчика при отметке подтемы не меняет прогресс и ничего не объявляет', async () => {
		const refuse = vi.fn(() => false)
		const { user, wrapper } = mountView({ beforeStatusChange: refuse })
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.click(within(screen.getByRole('complementary')).getByRole('checkbox', { name: 'Теги' }))
		await waitFor(() => expect(refuse).toHaveBeenCalled())
		expect(wrapper.emitted('update:progress')).toBeUndefined()
	})

	it('закрытие панели темы из свёрнутого этапа не находит строку и не падает', async () => {
		const { user, api } = mountView()
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		api.collapseAll()
		within(screen.getByRole('complementary')).getByRole('checkbox', { name: 'Теги' }).focus()
		await user.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('complementary')).not.toBeInTheDocument())
	})

	it('закрытие панели и размонтирование сразу после него не падают', async () => {
		const { user, wrapper } = mountView()
		await user.click(screen.getByRole('button', { name: /^HTML/ }))
		await user.keyboard('{Escape}')
		wrapper.unmount()
		await Promise.resolve()
		expect(document.body.querySelector('.base-roadmap')).toBeNull()
	})
})
