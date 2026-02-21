import SummaryApi from '../common'

const getRecommendations = async (wishlistItems = [], viewedProducts = []) => {
  try {
    const response = await fetch(SummaryApi.recommendations.url, {
      method: SummaryApi.recommendations.method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        wishlist: wishlistItems || [],
        viewed: viewedProducts || []
      })
    })
    const data = await response.json()
    return { data: data?.data || [], success: data?.success || false }
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return { data: [], success: false }
  }
}

export const getRecentlyViewed = () => {
  try {
    const stored = localStorage.getItem('recentlyViewed')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const addToRecentlyViewed = (productId) => {
  try {
    let viewed = getRecentlyViewed()
    viewed = viewed.filter(id => id !== productId)
    viewed.unshift(productId)
    viewed = viewed.slice(0, 20)
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed))
  } catch (error) {
    console.error("Error saving to recently viewed:", error)
  }
}

export default getRecommendations
