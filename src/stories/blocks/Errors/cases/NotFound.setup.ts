import { ref } from 'vue'
import type { SearchResult } from '@components/BaseSearch'

const pages: SearchResult[] = [
	{ id: 'pricing', title: 'Тарифы', description: 'Планы и цены', icon: 'star' },
	{ id: 'docs', title: 'Документация', description: 'Установка и компоненты', icon: 'file-md' },
	{ id: 'support', title: 'Поддержка', description: 'Вопросы и ответы', icon: 'comment' },
	{ id: 'blog', title: 'Блог', description: 'Новости и релизы', icon: 'list-bullet' },
]

const popular = pages.slice(0, 3)

export function setup() {
	const query = ref('')
	const message = ref('')

	function open(page: SearchResult): void {
		message.value = `Открыт раздел «${page.title}»`
	}

	return { pages, popular, query, message, open }
}
