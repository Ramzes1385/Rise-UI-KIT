import '@testing-library/jest-dom/vitest'
import type { Plugin } from 'vue'
import { nextTick, ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseScrollArea from '../ui/BaseScrollArea.vue'
import type { BaseScrollAreaExpose } from '../types/BaseScrollArea.types'

const PARTS = ['viewport', 'content', 'bar', 'thumb'] as const

async function setup(props: Record<string, unknown>, plugins: Plugin[] = []) {
	const api = ref<BaseScrollAreaExpose | null>(null)
	const result = render(
		{
			components: { BaseScrollArea },
			setup: () => ({ api, props }),
			template: '<BaseScrollArea ref="api" v-bind="props"><p>Длинный текст</p></BaseScrollArea>',
		},
		{ global: { plugins } },
	)
	const viewport = result.container.querySelector('.base-scroll-area__viewport') as HTMLElement
	Object.defineProperty(viewport, 'clientHeight', { value: 100, configurable: true })
	Object.defineProperty(viewport, 'scrollHeight', { value: 400, configurable: true })
	api.value!.update()
	await nextTick()
	return result.container
}

const part = (container: Element, name: string) => container.querySelector(`.base-scroll-area__${name}`)

describe('BaseScrollArea: проп ui', () => {
	it('без ui — только классы кита на частях', async () => {
		const container = await setup({})

		expect(part(container, 'viewport')).toHaveAttribute('class', 'base-scroll-area__viewport')
		expect(part(container, 'content')).toHaveAttribute('class', 'base-scroll-area__content')
		expect(part(container, 'bar')).toHaveAttribute('class', 'base-scroll-area__bar base-scroll-area__bar--y')
		expect(part(container, 'thumb')).toHaveAttribute('class', 'base-scroll-area__thumb')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(name => [name, `u-${name}`])])
		const container = await setup({ scrollbar: 'always', customClass: { root: 'own-root', thumb: 'own-thumb' }, ui })

		expect(container.querySelector('.base-scroll-area')).toHaveClass('u-root', 'base-scroll-area--scrollbar-always', 'own-root')
		for (const name of PARTS) expect(part(container, name)).toHaveClass(`base-scroll-area__${name}`, `u-${name}`)
		expect(part(container, 'bar')).toHaveClass('base-scroll-area__bar--y')
		expect(part(container, 'thumb')).toHaveClass('own-thumb')
	})

	it('классы из defaults.BaseScrollArea.ui плагина склеиваются с классами экземпляра', async () => {
		const plugin = createUiKitPlugin({ defaults: { BaseScrollArea: { ui: { viewport: 'app-viewport' } } } })
		const container = await setup({ ui: { viewport: 'own-viewport' } }, [plugin])

		expect(part(container, 'viewport')).toHaveAttribute('class', 'base-scroll-area__viewport app-viewport own-viewport')
	})
})
