export async function scrollList(canvasElement: HTMLElement): Promise<HTMLElement> {
	const list = canvasElement.querySelector('[id^="news-"]') as HTMLElement
	list.scrollTop = 600
	list.dispatchEvent(new Event('scroll'))
	return list
}
