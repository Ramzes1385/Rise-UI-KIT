export const NEWS = Array.from({ length: 40 }, (_, index) => `Новость ${index + 1}: склад в Волгограде принял ${20 + index} поставок`)

export async function scrollList(canvasElement: HTMLElement): Promise<HTMLElement> {
	const list = canvasElement.querySelector('[id^="news-"]') as HTMLElement
	list.scrollTop = 600
	list.dispatchEvent(new Event('scroll'))
	return list
}
