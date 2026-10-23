import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import BaseJsonViewer from '../ui/BaseJsonViewer.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseJsonViewer integration', () => {
	it('одна точка Tab в дереве, стрелки раскрывают узел и ведут к ребёнку', async () => {
		const user = userEvent.setup()
		render(BaseJsonViewer, { props: { value: { a: 1, b: { c: true } }, label: 'Данные', hasToolbar: false, expandDepth: 0 } })

		await user.tab()
		expect(screen.getByRole('treeitem', { name: 'a: 1' })).toHaveFocus()
		await user.keyboard('{ArrowDown}{ArrowRight}')
		expect(screen.getByRole('treeitem', { name: 'b: 1 ключ' })).toHaveAttribute('aria-expanded', 'true')
		await user.keyboard('{ArrowRight}')
		expect(screen.getByRole('treeitem', { name: 'c: true' })).toHaveFocus()
	})
})
