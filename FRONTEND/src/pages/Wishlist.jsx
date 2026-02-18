import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import VerticalCard from '../components/VerticalCard'
import { Link } from 'react-router-dom'

const Wishlist = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await fetch(SummaryApi.getWishlist.url, {
        method: SummaryApi.getWishlist.method,
        credentials: 'include',
        headers: {
          "content-type": "application/json"
        }
      })

      const dataResponse = await response.json()
      setData(dataResponse?.data || [])
    } catch (error) {
      console.error("Wishlist error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  return (
    <div className='container mx-auto p-4'>
      <h2 className='text-2xl font-bold py-4'>My Wishlist</h2>
      
      {loading ? (
        <p className="text-lg text-center">Loading...</p>
      ) : data.length > 0 ? (
        <>
          <p className="text-lg font-semibold mb-3">
            Wishlist Items: {data.length}
          </p>
          <VerticalCard data={data} loading={loading} />
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-slate-500 mb-4">Your wishlist is empty</p>
          <Link to="/" className="text-red-600 hover:underline">Continue Shopping</Link>
        </div>
      )}
    </div>
  )
}

export default Wishlist
