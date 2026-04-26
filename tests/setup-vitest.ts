/**
 * Глобальная настройка Vitest.
 * Очистка DOM и восстановление моков после каждого теста.
 * Матчеры jest-dom подключаются в каждом тест-файле индивидуально
 * через import '@testing-library/jest-dom/vitest'.
 */

import { cleanup } from '@testing-library/vue'

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	vi.clearAllMocks()
})
