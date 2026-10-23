import { shareItems } from '../../model/sharing/shareNetworks'
import { MEDIA_SHARE_NETWORKS } from '../../types/panels/MediaShare.types'

const CONTENT = { url: 'https://example.com/watch?v=7&t=83', text: 'Демо & друзья', image: 'https://example.com/poster.jpg' }

const hrefs = () => Object.fromEntries(shareItems(MEDIA_SHARE_NETWORKS, CONTENT).map(item => [item.network, item.href]))

describe('shareNetworks', () => {
	it('ссылки всех соцсетей: адрес и название закодированы, пробелы — %20', () => {
		const links = hrefs()
		const url = encodeURIComponent(CONTENT.url)
		const text = encodeURIComponent(CONTENT.text)
		const message = encodeURIComponent(`${CONTENT.text} ${CONTENT.url}`)

		expect(Object.keys(links)).toEqual([...MEDIA_SHARE_NETWORKS])
		expect(links.vk).toBe(`https://vk.com/share.php?url=${url}&title=${text}`)
		expect(links.telegram).toBe(`https://t.me/share/url?url=${url}&text=${text}`)
		expect(links.whatsapp).toBe(`https://wa.me/?text=${message}`)
		expect(links.odnoklassniki).toBe(`https://connect.ok.ru/offer?url=${url}&title=${text}`)
		expect(links.viber).toBe(`viber://forward?text=${message}`)
		expect(links.x).toBe(`https://x.com/intent/tweet?text=${text}&url=${url}`)
		expect(links.facebook).toBe(`https://www.facebook.com/sharer/sharer.php?u=${url}`)
		expect(links.reddit).toBe(`https://www.reddit.com/submit?url=${url}&title=${text}`)
		expect(links.linkedin).toBe(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`)
		expect(links.pinterest).toBe(
			`https://www.pinterest.com/pin/create/button/?url=${url}&media=${encodeURIComponent(CONTENT.image)}&description=${text}`,
		)
		expect(links.tumblr).toBe(`https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&title=${text}`)
		expect(links.threads).toBe(`https://www.threads.net/intent/post?text=${message}`)
		expect(links.bluesky).toBe(`https://bsky.app/intent/compose?text=${message}`)
		expect(links.line).toBe(`https://social-plugins.line.me/lineit/share?url=${url}`)
		expect(links.weibo).toBe(`https://service.weibo.com/share/share.php?url=${url}&title=${text}`)
		expect(links.xing).toBe(`https://www.xing.com/spi/shares/new?url=${url}`)
		expect(links['hacker-news']).toBe(`https://news.ycombinator.com/submitlink?u=${url}&t=${text}`)
		expect(links.flipboard).toBe(`https://share.flipboard.com/bookmarklet/popout?v=2&url=${url}&title=${text}`)
		expect(links.email).toBe(`mailto:?subject=${text}&body=${url}`)
		expect(links.whatsapp).not.toContain('+')
	})

	it('порядок из списка, повторы и неизвестные сети отбрасываются; без названия и картинки — только ссылка', () => {
		const items = shareItems(['email', 'vk', 'email', 'myspace' as never, 'viber', 'pinterest'], {
			url: 'https://example.com/7',
			text: '',
		})

		expect(items.map(item => item.network)).toEqual(['email', 'vk', 'viber', 'pinterest'])
		expect(items.map(item => item.label)).toEqual(['Почта', 'ВКонтакте', 'Viber', 'Pinterest'])
		expect(items.map(item => item.isExternal)).toEqual([false, true, false, true])
		expect(items[2].href).toBe(`viber://forward?text=${encodeURIComponent('https://example.com/7')}`)
		expect(items[3].href).toBe(`https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent('https://example.com/7')}`)
		expect(items[1]).toMatchObject({ icon: 'vk', color: '#0077ff' })
		expect(items[0].icon).toBe('email')
	})

	it('у каждой сети свой значок и цвет плитки; Одноклассники — по-русски', () => {
		const items = shareItems(MEDIA_SHARE_NETWORKS, CONTENT)

		expect(new Set(items.map(item => item.icon)).size).toBe(items.length)
		expect(items.every(item => /^#[0-9a-f]{6}$/.test(item.color))).toBe(true)
		expect(items.find(item => item.network === 'odnoklassniki')?.label).toBe('Одноклассники')
	})
})
