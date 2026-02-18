import SummaryApi from "../common"

export default async function fetchCategories() {
    try {
        const response = await fetch(SummaryApi.categoryDynamic.url)
        const dataResponse = await response.json()
        return dataResponse?.data || []
    } catch (error) {
        console.error("Category fetch error:", error)
        return []
    }
}
