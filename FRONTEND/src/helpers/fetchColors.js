import SummaryApi from "../common"

export default async function fetchColors() {
    try {
        const response = await fetch(SummaryApi.colorProduct.url)
        const dataResponse = await response.json()
        return dataResponse?.data || []
    } catch (error) {
        console.error("Color fetch error:", error)
        return []
    }
}
