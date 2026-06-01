import '@testing-library/jest-dom/vitest'

import { ref } from 'vue'

import { usePasswordVisibility } from './usePasswordVisibility'

describe('usePasswordVisibility', () => {
	it('начинает с невидимым паролем', () => {
		const type = ref('password')
		const { isPasswordVisible, inputType } = usePasswordVisibility({ type })
		expect(isPasswordVisible.value).toBe(false)
		expect(inputType.value).toBe('password')
	})

	it('переключает видимость пароля', () => {
		const type = ref('password')
		const { isPasswordVisible, inputType, togglePasswordVisibility } = usePasswordVisibility({ type })
		togglePasswordVisibility()
		expect(isPasswordVisible.value).toBe(true)
		expect(inputType.value).toBe('text')
	})

	it('переключает обратно', () => {
		const type = ref('password')
		const { inputType, togglePasswordVisibility } = usePasswordVisibility({ type })
		togglePasswordVisibility()
		togglePasswordVisibility()
		expect(inputType.value).toBe('password')
	})

	it('не меняет тип если не password', () => {
		const type = ref('text')
		const { inputType, togglePasswordVisibility } = usePasswordVisibility({ type })
		togglePasswordVisibility()
		expect(inputType.value).toBe('text')
	})

	it('не меняет тип email даже если видимость включена', () => {
		const type = ref('email')
		const { inputType, isPasswordVisible, togglePasswordVisibility } = usePasswordVisibility({ type })
		togglePasswordVisibility()
		expect(isPasswordVisible.value).toBe(true)
		expect(inputType.value).toBe('email')
	})
})
