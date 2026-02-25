import SummaryApi from "../common"

const fetchCategoryWiseProduct = async(category, gender)=>{
    const response = await fetch(SummaryApi.categoryWiseProduct.url,{
        method: SummaryApi.categoryWiseProduct.method,
        headers: {
            "content-type" : "application/json"
        },
        body : JSON.stringify({
            category : category,
            gender : gender
        })
    })

    const dataResponse = await response.json()

    return dataResponse
}

export default fetchCategoryWiseProduct