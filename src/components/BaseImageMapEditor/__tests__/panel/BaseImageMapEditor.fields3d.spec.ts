import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createUiKitPlugin } from '@/plugin'
import { screen } from '@testing-library/vue'
import type { VueWrapper } from '@vue/test-utils'
import BaseImageMapEditor from '../../ui/BaseImageMapEditor.vue'
import { makeMap, renderEditor } from '../utils/editorTestUtils'
import ImageMapEditorField from '../../ui/ImageMapEditorField.vue'
import type { BaseImageMapEditorExpose } from '../../types/BaseImageMapEditor.types'
import type { ImageMap3DData } from '@components/BaseImageMap3D/types/imageMap3dData.types'
import type { EditorField, EditorFieldValue } from '../../types/imageMapEditorInternal.types'

function map3d(): ImageMap3DData {
	const map = makeMap() as ImageMap3DData
	map.layers[0] = { ...map.layers[0]!, elevation: 0, model: { url: '/f1.glb', scale: 2 } }
	map.objects[0] = { ...map.objects[0]!, height3d: 30, meshName: 'Hall' }
	map.scene3d = { floorGap: 150 }
	return map
}

function mountEditor(props: Record<string, unknown> = {}) {
	return mount(BaseImageMapEditor, { props: { modelValue: map3d(), has3dFields: true, selected: 'r1', ...props } })
}

function field(wrapper: VueWrapper, key: string) {
	return wrapper.findAllComponents(ImageMapEditorField).find(item => (item.props('field') as EditorField).key === key)
}

async function setField(wrapper: VueWrapper, key: string, value: EditorFieldValue): Promise<void> {
	const target = field(wrapper, key)
	if (!target) throw new Error(key)
	target.vm.$emit('update', value)
	await nextTick()
}

function lastData(wrapper: VueWrapper): ImageMap3DData {
	return wrapper.emitted('update:modelValue')?.at(-1)?.[0] as ImageMap3DData
}

describe('BaseImageMapEditor: поля 3D', () => {
	it('по умолчанию полей 3D нет', () => {
		renderEditor({ selected: 'r1' })
		expect(screen.queryByRole('heading', { name: '3D' })).toBeNull()
		expect(screen.queryByLabelText('Высота в 3D')).toBeNull()
	})

	it('has3dFields: раздел объекта, поля этажа и сцены со значениями из JSON', () => {
		renderEditor({ modelValue: map3d(), has3dFields: true, selected: 'r1' })
		expect(screen.getByRole('heading', { name: '3D' })).toBeInTheDocument()
		expect(screen.getByRole('group', { name: 'Этаж «Первый»' })).toBeInTheDocument()
		expect(screen.getByRole('group', { name: 'Сцена' })).toBeInTheDocument()
		expect(screen.getByLabelText('Узел в модели этажа')).toHaveValue('Hall')
		expect(screen.getByLabelText('Модель этажа (GLB)')).toHaveValue('/f1.glb')
		expect(screen.getByLabelText('Масштаб модели')).toBeInTheDocument()
		expect(screen.getByLabelText('Расстояние между этажами')).toBeInTheDocument()
	})

	it('правка полей объекта, этажа и сцены попадает в v-model', async () => {
		const wrapper = mountEditor()
		await setField(wrapper, 'height3d', 45)
		expect(lastData(wrapper).objects[0]).toMatchObject({ height3d: 45, meshName: 'Hall' })
		await setField(wrapper, 'meshName', '')
		expect(lastData(wrapper).objects[0]).not.toHaveProperty('meshName')
		await setField(wrapper, 'elevation', 10)
		await setField(wrapper, 'model.z', 4)
		expect(lastData(wrapper).layers[0]).toMatchObject({ elevation: 10, model: { url: '/f1.glb', scale: 2, position: [0, 0, 4] } })
		await setField(wrapper, 'objectHeight', 25)
		expect(lastData(wrapper).scene3d).toEqual({ floorGap: 150, objectHeight: 25 })
	})

	it('неверное значение — ошибка поля, JSON не меняется', async () => {
		const wrapper = mountEditor()
		await setField(wrapper, 'model.scale', 0)
		await setField(wrapper, 'floorThickness', 0)
		await setField(wrapper, 'meshName', '   ')
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
		expect(field(wrapper, 'model.scale')?.props('field')).toMatchObject({ error: 'Ожидается число больше 0' })
		expect(field(wrapper, 'floorThickness')?.props('field')).toMatchObject({ error: 'Ожидается число больше 0' })
		expect(field(wrapper, 'meshName')?.props('field')).toMatchObject({ error: 'Ожидается непустая строка' })
		await setField(wrapper, 'model.scale', 1)
		expect(field(wrapper, 'model.scale')?.props('field')).toMatchObject({ error: '' })
	})

	it('смена этажа сбрасывает ошибки полей этажа; без адреса модели её поля скрыты', async () => {
		const wrapper = mountEditor()
		await setField(wrapper, 'model.scale', 0)
		await wrapper.setProps({ layer: 'l2' })
		expect(field(wrapper, 'model.scale')).toBeUndefined()
		await wrapper.setProps({ layer: 'l1' })
		expect(field(wrapper, 'model.scale')?.props('field')).not.toMatchObject({ error: 'Ожидается число больше 0' })
		await setField(wrapper, 'model.url', '')
		expect(lastData(wrapper).layers[0]).not.toHaveProperty('model')
		expect(field(wrapper, 'model.scale')).toBeUndefined()
	})

	it('isDisabled: правка 3D-полей не проходит', async () => {
		const wrapper = mountEditor({ isDisabled: true })
		await setField(wrapper, 'elevation', 5)
		await setField(wrapper, 'floorGap', 5)
		await setField(wrapper, 'height3d', 5)
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
	})

	it('экспорт и импорт JSON сохраняют 3D-поля', async () => {
		const wrapper = mountEditor()
		const api = wrapper.vm as unknown as BaseImageMapEditorExpose
		const exported = JSON.parse(api.exportJson()) as ImageMap3DData
		expect(exported.layers[0]).toMatchObject({ elevation: 0, model: { url: '/f1.glb', scale: 2 } })
		expect(exported.objects[0]).toMatchObject({ height3d: 30, meshName: 'Hall' })
		expect(exported.scene3d).toEqual({ floorGap: 150 })
		const next = { ...exported, scene3d: { floorThickness: 8 } }
		expect(api.importJson(JSON.stringify(next))).toBe(true)
		await nextTick()
		expect(lastData(wrapper).scene3d).toEqual({ floorThickness: 8 })
		expect(lastData(wrapper).layers[0]?.model).toEqual({ url: '/f1.glb', scale: 2 })
	})

	it('has3dFields берётся из defaults плагина', () => {
		const wrapper = mount(BaseImageMapEditor, {
			props: { modelValue: map3d(), selected: 'r1' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseImageMapEditor: { has3dFields: true } } })] },
		})
		expect(field(wrapper, 'height3d')).toBeDefined()
	})
})
