import '@testing-library/jest-dom/vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { render, screen } from '@testing-library/vue'
import BaseColorModeButton from '../ui/BaseColorModeButton.vue'
import { createColorMode } from '@composables/app/useColorMode'

describe('BaseColorModeButton SSR', () => {
	it('сохранённая тёмная тема: сервер рисует нейтральное состояние (солнце, aria-pressed="false"), как первый кадр гидратации', async () => {
		const colorMode = createColorMode({ target: () => null, storageKey: false, initialMode: 'dark' })

		const html = await renderToString(createSSRApp({ render: () => h(BaseColorModeButton, { colorMode }) }))

		expect(html).toContain('aria-pressed="false"')
		expect(html).toMatch(/#sun/)
		expect(html).not.toMatch(/#moon/)
		colorMode.stop()
	})

	it('после монтирования иконка и aria-pressed показывают реальную тему', async () => {
		const colorMode = createColorMode({ target: () => null, storageKey: false, initialMode: 'dark' })
		render(BaseColorModeButton, { props: { colorMode } })

		const button = await screen.findByRole('button', { pressed: true })

		expect(button.querySelector('use')?.getAttribute('href')).toMatch(/#moon$/)
		colorMode.stop()
	})
})
