export const resolveNewsDetailSlug = (slugs, search = '') => {
  const available = Array.isArray(slugs) ? slugs.filter(Boolean) : []
  if (!available.length) return null

  const requested = new URLSearchParams(search).get('slug')
  if (!requested) return available[0]
  return available.includes(requested) ? requested : null
}

export const initNewsDetail = (root = document) => Array.from(root.querySelectorAll('[data-news-detail-view]')).map((view) => {
  const articles = Array.from(view.querySelectorAll('[data-news-detail-article]'))
  const notFound = view.querySelector('[data-news-detail-not-found]')
  const selectedSlug = resolveNewsDetailSlug(
    articles.map((article) => article.dataset.newsSlug),
    globalThis.location?.search || '',
  )

  articles.forEach((article) => {
    const selected = article.dataset.newsSlug === selectedSlug
    article.hidden = !selected
    article.classList.toggle('hidden', !selected)
  })

  if (notFound) {
    const showNotFound = selectedSlug === null
    notFound.hidden = !showNotFound
    notFound.classList.toggle('hidden', !showNotFound)
  }

  return { selectedSlug }
})
