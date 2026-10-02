import '@testing-library/jest-dom/vitest'
import BaseCardInput from '../ui/BaseCardInput.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

describe('BaseCardInput integration', () => {
	it('эмитит текущее значение поля при каждом введённом символе', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseCardInput, { props: { label: 'Название' } })
		await user.type(screen.getByLabelText('Название'), 'ab')
		expect(emitted()['update:modelValue']).toEqual([['a'], ['ab']])
	})
})
