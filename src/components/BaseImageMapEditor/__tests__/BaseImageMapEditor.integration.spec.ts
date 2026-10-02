import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseImageMapEditor from '../ui/BaseImageMapEditor.vue'

describe('BaseImageMapEditor integration', () => {
	it('эмитит текущее значение поля при каждом введённом символе', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseImageMapEditor, { props: { label: 'Название' } })
		await user.type(screen.getByLabelText('Название'), 'ab')
		expect(emitted()['update:modelValue']).toEqual([['a'], ['ab']])
	})
})
