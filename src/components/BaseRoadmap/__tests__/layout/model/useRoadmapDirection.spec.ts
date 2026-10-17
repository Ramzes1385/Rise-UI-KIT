import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useRoadmapDirection } from '../../../model/layout/useRoadmapDirection'

const Probe = defineComponent({
	setup() {
		const root = ref<HTMLElement | null>(null)
		const isRtl = useRoadmapDirection(root)
		return () => h('div', { ref: root, 'data-rtl': String(isRtl.value) })
	},
})

function mountProbe(parent?: HTMLElement) {
	const host = document.createElement('div')
	;(parent ?? document.body).append(host)
	return mount(Probe, { attachTo: host })
}

async function flush(): Promise<void> {
	await new Promise(resolve => setTimeout(resolve, 0))
	await nextTick()
}

afterEach(() => {
	document.documentElement.removeAttribute('dir')
	document.body.innerHTML = ''
})

describe('useRoadmapDirection', () => {
	it('в LTR после монтирования не RTL', () => {
		const wrapper = mountProbe()
		expect(wrapper.attributes('data-rtl')).toBe('false')
		wrapper.unmount()
	})

	it('dir="rtl" у предка даёт RTL сразу после монтирования', async () => {
		const scope = document.createElement('div')
		scope.setAttribute('dir', 'rtl')
		document.body.append(scope)
		const wrapper = mountProbe(scope)
		await nextTick()
		expect(wrapper.attributes('data-rtl')).toBe('true')
		wrapper.unmount()
	})

	it('следит за dir у html', async () => {
		const wrapper = mountProbe()
		document.documentElement.setAttribute('dir', 'rtl')
		await flush()
		expect(wrapper.attributes('data-rtl')).toBe('true')
		document.documentElement.setAttribute('dir', 'ltr')
		await flush()
		expect(wrapper.attributes('data-rtl')).toBe('false')
		wrapper.unmount()
	})

	it('следит за dir у ближайшего предка с dir', async () => {
		const scope = document.createElement('section')
		scope.setAttribute('dir', 'ltr')
		document.body.append(scope)
		const wrapper = mountProbe(scope)
		scope.setAttribute('dir', 'rtl')
		await flush()
		expect(wrapper.attributes('data-rtl')).toBe('true')
		wrapper.unmount()
	})

	it('после размонтирования перестаёт следить', async () => {
		const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
		const wrapper = mountProbe()
		wrapper.unmount()
		expect(disconnect).toHaveBeenCalledTimes(1)
		disconnect.mockRestore()
	})

	it('dir на самом html: один наблюдатель, RTL сразу и возврат в LTR', async () => {
		document.documentElement.setAttribute('dir', 'rtl')
		const observe = vi.spyOn(MutationObserver.prototype, 'observe')
		const wrapper = mountProbe()
		await nextTick()
		expect(wrapper.attributes('data-rtl')).toBe('true')
		expect(observe).toHaveBeenCalledTimes(1)
		document.documentElement.setAttribute('dir', 'ltr')
		await flush()
		expect(wrapper.attributes('data-rtl')).toBe('false')
		wrapper.unmount()
		observe.mockRestore()
	})
})
