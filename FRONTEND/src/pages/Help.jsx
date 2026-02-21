import React from 'react'
import { Link } from 'react-router-dom'

const Help = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">How do I track my order?</h3>
              <p className="text-gray-600 text-sm">Go to your account settings and click on "Orders" to view your order history and tracking information.</p>
            </div>
            <div>
              <h3 className="font-medium">What is your return policy?</h3>
              <p className="text-gray-600 text-sm">You can return any item within 30 days of purchase. Items must be unused and in original packaging.</p>
            </div>
            <div>
              <h3 className="font-medium">How do I contact customer support?</h3>
              <p className="text-gray-600 text-sm">You can email us at support@lockerroom.com or call our hotline.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Email</h3>
              <p className="text-gray-600">support@lockerroom.com</p>
            </div>
            <div>
              <h3 className="font-medium">Phone</h3>
              <p className="text-gray-600">+233 123 456 789</p>
            </div>
            <div>
              <h3 className="font-medium">Working Hours</h3>
              <p className="text-gray-600">Mon - Fri: 9AM - 6PM</p>
              <p className="text-gray-600">Sat: 10AM - 4PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Need More Help?</h2>
        <p className="text-gray-600 mb-4">If you can't find the answer you're looking for, please contact our customer support team.</p>
        <Link to="/contact" className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Contact Us
        </Link>
      </div>
    </div>
  )
}

export default Help
