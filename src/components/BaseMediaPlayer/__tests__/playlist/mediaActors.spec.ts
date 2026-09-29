import { actorCards } from '../../model/playlist/mediaActors'

describe('mediaActors', () => {
	it('значок и название соцсети — по адресу, в том числе с www и поддоменами; остальное — «Сайт»', () => {
		const [card] = actorCards([
			{
				name: 'Мира Звёздная',
				role: 'Капитан Вега',
				links: [
					'https://www.instagram.com/mira/',
					'https://vk.com/mira',
					'https://m.vk.ru/mira',
					'https://t.me/mira',
					'https://telegram.me/mira',
					'https://twitter.com/mira',
					'https://x.com/mira',
					'https://facebook.com/mira',
					'https://fb.com/mira',
					'https://youtu.be/abc',
					'https://www.youtube.com/@mira',
					'https://www.tiktok.com/@mira',
					'https://www.threads.net/@mira',
					'https://www.threads.com/@mira',
					'https://www.imdb.com/name/nm1',
					'https://ok.ru/mira',
					'https://example.com/mira',
					'https://notvk.com/mira',
				],
			},
		])

		expect(card.links.map(link => link.icon)).toEqual([
			'instagram',
			'vk',
			'vk',
			'telegram',
			'telegram',
			'x',
			'x',
			'facebook',
			'facebook',
			'youtube',
			'youtube',
			'tiktok',
			'threads',
			'threads',
			'imdb',
			'odnoklassniki',
			'globe',
			'globe',
		])
		expect(card.links[0]).toEqual({
			url: 'https://www.instagram.com/mira/',
			label: 'Instagram',
			ariaLabel: 'Instagram: Мира Звёздная',
			icon: 'instagram',
			color: '#e1306c',
		})
		expect(card.links.map(link => link.label).slice(1, 3)).toEqual(['ВКонтакте', 'ВКонтакте'])
		expect(card.links.at(-3)?.label).toBe('Одноклассники')
		expect(card.links.at(-1)).toMatchObject({ label: 'Сайт', ariaLabel: 'Сайт: Мира Звёздная', icon: 'globe' })
		expect(card).toMatchObject({ id: '0:Мира Звёздная', name: 'Мира Звёздная', role: 'Капитан Вега', photo: undefined })
	})

	it('небезопасные ссылки и фото отбрасываются, относительное фото остаётся; без актёров — пусто', () => {
		const cards = actorCards([
			{ id: 'lev', name: 'Лев Громов', photo: '/lev.webp', links: ['javascript:alert(1)', 'ftp://example.com/lev', '/lev'] },
			{ name: 'Ася', photo: 'javascript:alert(1)' },
		])

		expect(cards[0]).toMatchObject({ id: 'lev', photo: '/lev.webp' })
		expect(cards[0].links.map(link => link.url)).toEqual(['/lev'])
		expect(cards[0].links[0].icon).toBe('globe')
		expect(cards[1]).toMatchObject({ id: '1:Ася', photo: undefined, links: [] })
		expect(actorCards(undefined)).toEqual([])
	})
})
