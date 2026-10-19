import { vi } from 'vitest'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { editData, stage, topic } from '../fixtures/editFixtures'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import { stageMenu } from '../../../model/edit/data/roadmapStageMenu'
import { editText, moveLabel } from '../../../model/edit/data/roadmapLabels'
import { listPatch, newMaterial, nextSubtopic, replaceAt } from '../../../model/edit/data/roadmapInspectorLists'

describe('editText и moveLabel', () => {
	it('editText подставляет параметры в строку словаря', () => {
		expect(editText('LABEL_ADD_STAGE', { title: 'Новый' })).toBe('Добавлен этап «Новый»')
	})

	it('перемещение без изменений даёт общую подпись', () => {
		const data = editData()
		expect(moveLabel(data, 'a', { index: 0 })).toBe('«Тема a» перемещено')
		expect(moveLabel(data, 'ghost', { index: 0 })).toBe('«ghost» перемещено')
	})

	it('этап: место и общее число этапов', () => {
		expect(moveLabel(editData(), 's1', { index: 2 })).toBe('Этап «Этап s1» перемещён на место 3 из 3')
	})

	it('тема: внутри этапа общее число не растёт, в другой этап — растёт на одну', () => {
		const data = editData()
		expect(moveLabel(data, 'a', { index: 2 })).toBe('Тема «Тема a» перемещена: этап «Этап s1», место 3 из 3')
		expect(moveLabel(data, 'a', { stage: 's2', index: 0 })).toBe('Тема «Тема a» перемещена: этап «Этап s2», место 1 из 3')
	})
})

describe('списки панели свойств', () => {
	it('nextSubtopic: номер по числу подтем, занятый id пропускается', () => {
		expect(nextSubtopic(topic('t'))).toEqual({ id: 's1', title: 'Подтема 1' })
		const taken = topic('t', { subtopics: [{ id: 's2', title: 'x' }] })
		expect(nextSubtopic(taken)).toMatchObject({ id: 's3', title: 'Подтема 2' })
	})

	it('newMaterial и replaceAt', () => {
		expect(newMaterial('video')).toEqual({ title: UI_ROADMAP_EDIT.NEW_MATERIAL, kind: 'video', url: '' })
		expect(replaceAt([{ n: 1 }, { n: 2 }], 1, { n: 5 })).toEqual([{ n: 1 }, { n: 5 }])
	})

	it('listPatch: пустой список превращается в undefined, исходный не меняется', () => {
		const source = [1, 2]
		expect(listPatch('materials', source, list => [...list, 3])).toEqual({ materials: [1, 2, 3] })
		expect(source).toEqual([1, 2])
		expect(listPatch('subtopics', undefined, list => list)).toEqual({ subtopics: undefined })
		expect(listPatch('subtopics', [1], () => [])).toEqual({ subtopics: undefined })
	})
})

describe('stageMenu', () => {
	function build(stageItem = stage('s1', [])) {
		const edit = { update: vi.fn() }
		const editor = { duplicate: vi.fn(), requestRemove: vi.fn() }
		const rename = vi.fn()
		const groups = stageMenu(stageItem, { edit, editor, rename } as never)
		return { groups, edit, editor, rename, flat: groups.flat() as Exclude<DropdownMenuItem, { type: 'label' }>[] }
	}

	it('две группы: действия и опасное удаление', () => {
		const { groups, flat } = build()
		expect(groups).toHaveLength(2)
		expect(flat.map(item => item.label)).toEqual([
			UI_ROADMAP_EDIT.MENU_RENAME,
			UI_ROADMAP_EDIT.MENU_DUPLICATE,
			UI_ROADMAP_EDIT.MENU_OPTIONAL,
			UI_ROADMAP_EDIT.MENU_REMOVE,
		])
		expect(flat[3]).toMatchObject({ isDanger: true, shortcut: 'Del' })
	})

	it('пункты вызывают нужные действия', () => {
		const { flat, edit, editor, rename } = build()
		flat[0].onSelect?.()
		flat[1].onSelect?.()
		flat[2].onSelect?.()
		flat[3].onSelect?.()
		expect(rename).toHaveBeenCalledOnce()
		expect(editor.duplicate).toHaveBeenCalledWith('s1')
		expect(edit.update).toHaveBeenCalledWith('s1', { kind: 'optional' })
		expect(editor.requestRemove).toHaveBeenCalledWith('s1')
	})

	it('у необязательного этапа пункт возвращает обязательность', () => {
		const { flat, edit } = build(stage('s1', [], { kind: 'optional' }))
		expect(flat[2].label).toBe(UI_ROADMAP_EDIT.MENU_REQUIRED)
		flat[2].onSelect?.()
		expect(edit.update).toHaveBeenCalledWith('s1', { kind: undefined })
	})
})
