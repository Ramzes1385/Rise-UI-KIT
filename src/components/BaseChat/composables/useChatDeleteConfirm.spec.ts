import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useChatDeleteConfirm } from './useChatDeleteConfirm'

function createOptions(initialIds: string[] = []) {
	const deleted: string[][] = []
	const forwarded: string[][] = []
	const selectedMessageIds = ref<string[]>(initialIds)

	return {
		selectedMessageIds,
		deleted,
		forwarded,
		opts: {
			selectedMessageIds,
			onDelete: (ids: string[]) => { deleted.push(ids) },
			onForward: (ids: string[]) => { forwarded.push(ids) },
		},
	}
}

describe('useChatDeleteConfirm', () => {
	describe('handleDeleteSelected', () => {
		it('открывает подтверждение для выделенных сообщений', () => {
			const { opts } = createOptions(['msg1', 'msg2'])
			const dc = useChatDeleteConfirm(opts)

			dc.handleDeleteSelected()
			expect(dc.deleteConfirm.value).toEqual({ isOpen: true, ids: ['msg1', 'msg2'] })
		})

		it('не открывает подтверждение если нет выделенных', () => {
			const { opts } = createOptions([])
			const dc = useChatDeleteConfirm(opts)

			dc.handleDeleteSelected()
			expect(dc.deleteConfirm.value.isOpen).toBe(false)
		})
	})

	describe('handleDeleteSingle', () => {
		it('открывает подтверждение для одного сообщения', () => {
			const { opts } = createOptions()
			const dc = useChatDeleteConfirm(opts)

			dc.handleDeleteSingle('msg1')
			expect(dc.deleteConfirm.value).toEqual({ isOpen: true, ids: ['msg1'] })
		})
	})

	describe('handleConfirmDelete', () => {
		it('эмитит onDelete и сбрасывает состояние', () => {
			const { opts, deleted, selectedMessageIds } = createOptions(['msg1', 'msg2'])
			const dc = useChatDeleteConfirm(opts)

			dc.handleDeleteSelected()
			dc.handleConfirmDelete()

			expect(deleted).toEqual([['msg1', 'msg2']])
			expect(selectedMessageIds.value).toEqual([])
			expect(dc.deleteConfirm.value).toEqual({ isOpen: false, ids: [] })
		})
	})

	describe('handleCancelDelete', () => {
		it('закрывает окно подтверждения', () => {
			const { opts } = createOptions(['msg1'])
			const dc = useChatDeleteConfirm(opts)

			dc.handleDeleteSelected()
			dc.handleCancelDelete()
			expect(dc.deleteConfirm.value.isOpen).toBe(false)
		})
	})

	describe('handleForwardSelected', () => {
		it('эмитит onForward и сбрасывает выделение', () => {
			const { opts, forwarded, selectedMessageIds } = createOptions(['msg1', 'msg2'])
			const dc = useChatDeleteConfirm(opts)

			dc.handleForwardSelected()
			expect(forwarded).toEqual([['msg1', 'msg2']])
			expect(selectedMessageIds.value).toEqual([])
		})
	})

	describe('handleCancelSelection', () => {
		it('сбрасывает выделение', () => {
			const { opts, selectedMessageIds } = createOptions(['msg1'])
			const dc = useChatDeleteConfirm(opts)

			dc.handleCancelSelection()
			expect(selectedMessageIds.value).toEqual([])
		})
	})

	describe('deleteConfirmText', () => {
		it('возвращает текст для одного сообщения', () => {
			const { opts } = createOptions()
			const dc = useChatDeleteConfirm(opts)

			dc.handleDeleteSingle('msg1')
			expect(dc.deleteConfirmText.value).toBeTruthy()
		})

		it('возвращает текст с count для нескольких сообщений', () => {
			const { opts } = createOptions(['msg1', 'msg2', 'msg3'])
			const dc = useChatDeleteConfirm(opts)

			dc.handleDeleteSelected()
			expect(dc.deleteConfirmText.value).toContain('3')
		})
	})
})
