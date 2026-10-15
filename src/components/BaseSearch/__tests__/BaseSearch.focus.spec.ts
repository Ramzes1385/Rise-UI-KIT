import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseSearch from '../ui/BaseSearch.vue'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/vue'

type SearchExposed = { focus: () => void; blur: () => void }

function mountSearch(mode: 'default' | 'modal' | 'sidebar') {
	return mount(BaseSearch, { props: { mode }, attachTo: document.body })
}

describe('BaseSearch: focus и blur через expose', () => {
	it('default: focus() ставит фокус на input, blur() снимает', async () => {
		const wrapper = mountSearch('default')
		const input = wrapper.get('input').element as HTMLInputElement

		;(wrapper.vm as unknown as SearchExposed).focus()
		expect(document.activeElement).toBe(input)

		;(wrapper.vm as unknown as SearchExposed).blur()
		expect(document.activeElement).not.toBe(input)
		wrapper.unmount()
	})

	it.each(['modal', 'sidebar'] as const)('%s: blur() снимает фокус с поля в панели', async mode => {
		const wrapper = mountSearch(mode)
		await wrapper.get('input').trigger('click')
		const input = await waitFor(() => screen.getByRole('combobox'))
		await waitFor(() => expect(document.activeElement).toBe(input))

		;(wrapper.vm as unknown as SearchExposed).blur()
		expect(document.activeElement).not.toBe(input)

		;(wrapper.vm as unknown as SearchExposed).focus()
		expect(document.activeElement).toBe(input)
		wrapper.unmount()
	})

	it('modal: blur() при закрытой панели не падает', async () => {
		const wrapper = mountSearch('modal')
		await nextTick()
		expect(() => (wrapper.vm as unknown as SearchExposed).blur()).not.toThrow()
		wrapper.unmount()
	})
})

describe('BaseSearch: поле-триггер модального режима', () => {
	it('имеет роль textbox, имя и readonly; клик открывает панель', async () => {
		const user = userEvent.setup()
		const wrapper = mountSearch('modal')
		const trigger = screen.getByRole('textbox', { name: 'Поиск...' })
		expect(trigger).toHaveAttribute('readonly')

		await user.click(trigger)
		await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
		wrapper.unmount()
	})
})
