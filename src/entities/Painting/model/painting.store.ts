import { defineStore } from 'pinia'
import type { Painting } from './Painting.types'

export interface PaintingState {
	items: Painting[]
	isLoading: boolean
	error: string | null
}

export const usePaintingStore = defineStore('painting', {
	state: (): PaintingState => ({
		items: [],
		isLoading: false,
		error: null,
	}),

	getters: {
		getById: state => {
			return (id: number) => state.items.find(p => p.id === id)
		},
	},

	actions: {
		async fetchItems() {
			this.isLoading = true
			this.error = null

			try {
				// Имитация запроса к JSON API
				const response = await fetch('/api/paintings.json')

				if (!response.ok) {
					throw new Error('Ошибка при загрузке данных')
				}

				const data = (await response.json()) as Painting[]
				this.items = data
			} catch (err) {
				this.error = err instanceof Error ? err.message : 'Неизвестная ошибка'
				console.error('PaintingStore fetchItems error:', err)
			} finally {
				this.isLoading = false
			}
		},
	},
})
