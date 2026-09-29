import { parseThumbnails, thumbnailAt } from '../../model/preview/thumbnails'

const BASE = 'https://cdn.example.com/show/e1/thumbs.vtt'

describe('миниатюры WebVTT', () => {
	it('отрезки времени, адрес картинки относительно файла и часть спрайта', () => {
		const cues = parseThumbnails(
			[
				'WEBVTT',
				'',
				'1',
				'00:00:00.000 --> 00:00:05.000',
				'sprite.jpg#xywh=0,0,160,90',
				'',
				'00:05.000 --> 00:10,5 align:start',
				'/img/full.jpg',
				'',
				'01:00:00.000 --> 01:00:10.000',
				'https://img.example.com/a.jpg#xywh=160,90,160,90',
			].join('\r\n'),
			BASE,
		)

		expect(cues).toEqual([
			{ start: 0, end: 5, url: 'https://cdn.example.com/show/e1/sprite.jpg', area: { x: 0, y: 0, width: 160, height: 90 } },
			{ start: 5, end: 10.5, url: 'https://cdn.example.com/img/full.jpg', area: undefined },
			{ start: 3600, end: 3610, url: 'https://img.example.com/a.jpg', area: { x: 160, y: 90, width: 160, height: 90 } },
		])
		expect(thumbnailAt(cues, 4.9)?.url).toContain('sprite.jpg')
		expect(thumbnailAt(cues, 5)?.url).toContain('full.jpg')
		expect(thumbnailAt(cues, 20)).toBeNull()
	})

	it('пропускает блоки без времени, без картинки, с кривым временем, пустой областью и опасной схемой', () => {
		const text = [
			'WEBVTT',
			'',
			'NOTE комментарий',
			'',
			'00:00.000 --> 00:05.000',
			'',
			'00:00.000 --> soon',
			'a.jpg',
			'',
			'00:00.000 --> 00:05.000',
			'a.jpg#xywh=0,0,0,90',
			'',
			'00:05.000 --> 00:06.000',
			'javascript:alert(1)',
			'',
			'00:06.000 --> 00:07.000',
			'http://[bad',
		].join('\n')

		expect(parseThumbnails(text, BASE)).toEqual([{ start: 0, end: 5, url: 'https://cdn.example.com/show/e1/a.jpg', area: undefined }])
	})
})
