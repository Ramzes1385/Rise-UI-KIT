import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import BaseImageMapEditor from '../../ui/BaseImageMapEditor.vue'
import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'

function makeMap(): ImageMapData {
	return {
		version: 1,
		layers: [
			{ id: 'l1', title: 'Первый', image: 'https://example.com/1.png', width: 1000, height: 500 },
			{ id: 'l2', title: 'Второй', image: 'https://example.com/2.png', width: 1000, height: 500 },
		],
		objects: [
			{ type: 'point', id: 'p1', title: 'Вход', x: 0.5, y: 0.5 },
			{ type: 'ellipse', id: 'e1', title: 'Фонтан', x: 0.4, y: 0.7, rx: 0.05, ry: 0.05, layer: 'l2' },
		],
	}
}

function currentItems(wrapper: ReturnType<typeof mount>): string[] {
	return wrapper.findAll('[aria-current="true"]').map(item => item.find('.base-image-map-editor__item-title').text())
}

function buttonByText(wrapper: ReturnType<typeof mount>, label: string) {
	const button = wrapper.findAll('button').find(item => item.attributes('aria-label') === label || item.text() === label)
	if (!button) throw new Error(label)
	return button
}

describe('BaseImageMapEditor: исправление по отчёту 1157 — синхронизация v-model:selected и v-model:layer', () => {
	it('v-model:selected на объект другого слоя показывает его слой, эмитит update:layer и не эмитит update:selected', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeMap() } })
		expect(currentItems(wrapper)).toEqual(['Первый'])
		await wrapper.setProps({ selected: 'e1' })
		await nextTick()
		expect(currentItems(wrapper)).toEqual(['Фонтан', 'Второй'])
		expect(wrapper.find('[data-editor-handle]').exists()).toBe(true)
		expect(wrapper.emitted('update:layer')).toEqual([['l2']])
		expect(wrapper.emitted('update:selected')).toBeUndefined()
	})

	it('v-model:selected на объект текущего слоя слой не меняет', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeMap(), layer: 'l1' } })
		await wrapper.setProps({ selected: 'p1' })
		expect(currentItems(wrapper)).toEqual(['Вход', 'Первый'])
		expect(wrapper.emitted('update:layer')).toBeUndefined()
		expect(wrapper.emitted('update:selected')).toBeUndefined()
	})

	it('v-model:selected на несуществующий объект — снимает выделение и сообщает null', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeMap() } })
		await wrapper.setProps({ selected: 'nope' })
		await nextTick()
		expect(wrapper.emitted('update:selected')).toEqual([[null]])
		expect(wrapper.emitted('update:layer')).toBeUndefined()
	})

	it('удаление текущего этажа: показанный «по умолчанию» этаж приходит в update:layer', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeMap(), layer: 'l1' } })
		await buttonByText(wrapper, 'Удалить этаж «Первый»').trigger('click')
		await nextTick()
		expect(currentItems(wrapper)).toEqual(['Второй'])
		expect(wrapper.emitted('update:layer')).toEqual([['l2']])
	})

	it('первый этаж в пустом редакторе приходит в update:layer', async () => {
		const wrapper = mount(BaseImageMapEditor)
		const json = JSON.stringify({
			version: 1,
			layers: [{ id: 'f1', title: 'Этаж', image: 'https://example.com/f.png', width: 800, height: 400 }],
			objects: [],
		})
		expect((wrapper.vm as unknown as { importJson: (text: string) => boolean }).importJson(json)).toBe(true)
		await nextTick()
		expect(wrapper.emitted('update:layer')).toEqual([['f1']])
	})

	it('без v-model:layer выбор первого этажа (он показан по умолчанию) тоже сообщается', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeMap() } })
		await buttonByText(wrapper, 'Первый').trigger('click')
		expect(wrapper.emitted('update:layer')).toEqual([['l1']])
		await buttonByText(wrapper, 'Первый').trigger('click')
		expect(wrapper.emitted('update:layer')).toHaveLength(1)
	})

	it('при монтировании update:layer не эмитится', () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeMap() } })
		expect(wrapper.emitted('update:layer')).toBeUndefined()
	})
})

describe('BaseImageMapEditor: внешняя смена v-model:layer', () => {
	it('снимает выделение объекта другого слоя', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeMap(), selected: 'p1', layer: 'l1' } })
		await wrapper.setProps({ layer: 'l2' })
		expect(wrapper.emitted('update:selected')).toEqual([[null]])
		expect(currentItems(wrapper)).toEqual(['Второй'])
	})

	it('слой и объект этого слоя одновременно — выделение остаётся', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeMap(), selected: 'p1', layer: 'l1' } })
		await wrapper.setProps({ layer: 'l2', selected: 'e1' })
		expect(wrapper.emitted('update:selected')).toBeUndefined()
		expect(currentItems(wrapper)).toEqual(['Фонтан', 'Второй'])
	})

	it('объект того же слоя остаётся выделенным', async () => {
		const wrapper = mount(BaseImageMapEditor, { props: { modelValue: makeMap(), selected: 'e1', layer: 'l2' } })
		await wrapper.setProps({ layer: 'l1' })
		await wrapper.setProps({ layer: 'l2', selected: 'e1' })
		expect(wrapper.emitted('update:selected')).toEqual([[null]])
	})
})
