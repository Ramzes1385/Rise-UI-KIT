/**
 * Integration-тесты для BaseFormField.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseFormField from './BaseFormField.vue'

describe('BaseFormField integration', () => {
	it('должен рендерить label и error', () => {
		render(BaseFormField, {
			props: { label: 'Field Label', error: 'Error Message' },
		})

		expect(screen.getByText('Field Label')).toBeInTheDocument()
		expect(screen.getByText('Error Message')).toBeInTheDocument()
	})
})
