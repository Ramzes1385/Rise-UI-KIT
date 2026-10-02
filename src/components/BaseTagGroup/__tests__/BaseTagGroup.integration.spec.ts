import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import BaseTagGroup from '../ui/BaseTagGroup.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import type { TagGroupItem, TagGroupModelValue } from '../types/BaseTagGroup.types'

function renderGroup(initial: TagGroupItem[], props = 'is-removable') {
	const items = ref<TagGroupItem[]>(initial)
	const selected = ref<TagGroupModelValue>([])
	const remove = (item: TagGroupItem) => (items.value = items.value.filter(entry => entry.value !== item.value))
	const utils = render({
		components: { BaseTagGroup },
		setup: () => ({ items, selected, remove }),
		template: `<BaseTagGroup v-model="selected" :items="items" ${props} @remove="remove" />`,
	})
	return { ...utils, items, selected }
}

const LETTERS: TagGroupItem[] = [
	{ value: 'a', label: 'A' },
	{ value: 'b', label: 'B' },
	{ value: 'c', label: 'C' },
]

describe('BaseTagGroup integration', () => {
	it('multiple: Tab и Space выбирают несколько меток', async () => {
		const user = userEvent.setup()
		const { selected } = renderGroup(LETTERS, 'selection-mode="multiple"')

		await user.tab()
		await user.keyboard(' ')
		await user.tab()
		await user.keyboard(' ')

		expect(selected.value).toEqual(['a', 'b'])
		expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'true')
	})

	it('Delete удаляет метку, фокус — на следующую', async () => {
		const user = userEvent.setup()
		const { items } = renderGroup(LETTERS, 'selection-mode="multiple" is-removable')

		screen.getByRole('button', { name: 'B' }).focus()
		await user.keyboard('{Delete}')

		expect(items.value.map(item => item.value)).toEqual(['a', 'c'])
		expect(screen.getByRole('button', { name: 'C' })).toHaveFocus()
	})

	it('удаление последней — фокус на предыдущую, затем на группу', async () => {
		const user = userEvent.setup()
		renderGroup(LETTERS.slice(0, 2))

		await user.click(screen.getByRole('button', { name: 'Удалить метку B' }))
		expect(screen.getByRole('button', { name: 'Удалить метку A' })).toHaveFocus()

		await user.keyboard('{Backspace}')
		expect(screen.getByRole('group', { name: 'Метки' })).toHaveFocus()
	})

	it('пропускает выключенную соседку и берёт ближайшую доступную', async () => {
		const user = userEvent.setup()
		renderGroup([
			{ value: 'a', label: 'A' },
			{ value: 'b', label: 'B' },
			{ value: 'c', label: 'C', isDisabled: true },
		])

		screen.getByRole('button', { name: 'Удалить метку B' }).focus()
		await user.keyboard('{Delete}')

		expect(screen.getByRole('button', { name: 'Удалить метку A' })).toHaveFocus()
	})
})
