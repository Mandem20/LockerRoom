import React from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'

const CookiePolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'Cookie Policy' }]} />
      
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: March 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              This Cookie Policy explains what Cookies are and how LockerRoom ("we," "us," or "our") uses them on our 
              e-commerce website. This policy is designed to comply with Ghana's Data Protection Act, 2012 (Act 843), 
              the General Data Protection Regulation (GDPR), and other international cookie laws.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By using our website, you consent to the use of cookies as described in this policy. If you do not consent 
              to the use of cookies, you should disable them as outlined in Section 7 or refrain from using our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">2. What Are Cookies?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Cookies are small text files that are stored on your computer or mobile device when you visit websites. 
              They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Types of Cookies:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
                <li><strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a specified period</li>
                <li><strong>First-Party Cookies:</strong> Cookies set by our website</li>
                <li><strong>Third-Party Cookies:</strong> Cookies set by external services or partners</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">3. How We Use Cookies</h2>
            <p className="text-gray-600 mb-4">We use cookies for the following purposes:</p>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium text-gray-800">Essential/Strictly Necessary Cookies</h3>
                <p className="text-gray-600 text-sm mt-1">Required for the website to function. These include:</p>
                <ul className="list-disc list-inside text-gray-600 text-sm mt-2 ml-2">
                  <li>Authentication and security</li>
                  <li>Shopping cart functionality</li>
                  <li>Checkout and payment processing</li>
                  <li>Language and region preferences</li>
                  <li>Load balancing and performance</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium text-gray-800">Functional Cookies</h3>
                <p className="text-gray-600 text-sm mt-1">Enable enhanced functionality and personalization:</p>
                <ul className="list-disc list-inside text-gray-600 text-sm mt-2 ml-2">
                  <li>Remembering your preferences</li>
                  <li>Social media integration</li>
                  <li>Live chat support features</li>
                  <li>Wishlist functionality</li>
                  <li>Personalized recommendations</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium text-gray-800">Analytics/Performance Cookies</h3>
                <p className="text-gray-600 text-sm mt-1">Help us understand how visitors use our site:</p>
                <ul className="list-disc list-inside text-gray-600 text-sm mt-2 ml-2">
                  <li>Page traffic and visit duration</li>
                  <li>Navigation patterns and user behavior</li>
                  <li>A/B testing for improvements</li>
                  <li>Error tracking and debugging</li>
                  <li>Identifying popular products</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium text-gray-800">Marketing/Advertising Cookies</h3>
                <p className="text-gray-600 text-sm mt-1">Used to deliver relevant advertisements:</p>
                <ul className="list-disc list-inside text-gray-600 text-sm mt-2 ml-2">
                  <li>Personalized product recommendations</li>
                  <li>Retargeting and remarketing ads</li>
                  <li>Promotional offers based on interests</li>
                  <li>Social media advertising</li>
                  <li>Measuring ad campaign effectiveness</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">4. Specific Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-600 border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Cookie Name</th>
                    <th className="border p-3 text-left">Type</th>
                    <th className="border p-3 text-left">Purpose</th>
                    <th className="border p-3 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3">session_id</td>
                    <td className="border p-3">Essential</td>
                    <td className="border p-3">User session authentication</td>
                    <td className="border p-3">Session</td>
                  </tr>
                  <tr>
                    <td className="border p-3">cart_items</td>
                    <td className="border p-3">Essential</td>
                    <td className="border p-3">Shopping cart storage</td>
                    <td className="border p-3">30 days</td>
                  </tr>
                  <tr>
                    <td className="border p-3">wishlist</td>
                    <td className="border p-3">Functional</td>
                    <td className="border p-3">Saved wishlist items</td>
                    <td className="border p-3">1 year</td>
                  </tr>
                  <tr>
                    <td className="border p-3">preferences</td>
                    <td className="border p-3">Functional</td>
                    <td className="border p-3">Language and currency settings</td>
                    <td className="border p-3">1 year</td>
                  </tr>
                  <tr>
                    <td className="border p-3">_ga</td>
                    <td className="border p-3">Analytics</td>
                    <td className="border p-3">Google Analytics tracking</td>
                    <td className="border p-3">2 years</td>
                  </tr>
                  <tr>
                    <td className="border p-3">_gid</td>
                    <td className="border p-3">Analytics</td>
                    <td className="border p-3">Google Analytics session</td>
                    <td className="border p-3">24 hours</td>
                  </tr>
                  <tr>
                    <td className="border p-3">fbp</td>
                    <td className="border p-3">Marketing</td>
                    <td className="border p-3">Facebook Pixel advertising</td>
                    <td className="border p-3">3 months</td>
                  </tr>
                  <tr>
                    <td className="border p-3">ads_user_data</td>
                    <td className="border p-3">Marketing</td>
                    <td className="border p-3">Personalized ad targeting</td>
                    <td className="border p-3">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">5. Third-Party Cookies</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Some cookies are placed by third-party services that appear on our website. We do not control these cookies. 
              Third parties include:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border p-4 rounded">
                <h3 className="font-medium text-gray-800 mb-2">Google Analytics</h3>
                <p className="text-sm text-gray-600">Website analytics and performance monitoring. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Privacy Policy</a></p>
              </div>
              <div className="border p-4 rounded">
                <h3 className="font-medium text-gray-800 mb-2">Facebook/Meta</h3>
                <p className="text-sm text-gray-600">Advertising and social sharing. <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Privacy Policy</a></p>
              </div>
              <div className="border p-4 rounded">
                <h3 className="font-medium text-gray-800 mb-2">Payment Processors</h3>
                <p className="text-sm text-gray-600">Secure payment processing. Includes MTN Mobile Money, Vodafone Cash, AirtelTigo Money.</p>
              </div>
              <div className="border p-4 rounded">
                <h3 className="font-medium text-gray-800 mb-2">Customer Support</h3>
                <p className="text-sm text-gray-600">Live chat and customer service tools.</p>
              </div>
            </div>
            <p className="text-gray-600 mt-4">
              We recommend reviewing the privacy policies of these third parties to understand how they use cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">6. Legal Basis for Cookie Processing</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Ghana (Data Protection Act, 2012 - Act 843)</h3>
                <p>Under Ghana's Data Protection Act, we rely on the following lawful bases:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li><strong>Consent:</strong> For non-essential cookies, we require your explicit consent</li>
                  <li><strong>Legitimate Interest:</strong> For essential cookies necessary for service delivery</li>
                  <li><strong>Contractual Necessity:</strong> For cookies required to fulfill orders and transactions</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">European Union (GDPR)</h3>
                <p>For EU users, we comply with GDPR requirements:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li><strong>Strict Consent:</strong> Explicit consent required before placing non-essential cookies</li>
                  <li><strong>Granular Control:</strong> You can choose which categories to accept</li>
                  <li><strong>Easy Withdrawal:</strong> Consent can be withdrawn at any time</li>
                  <li><strong>Privacy by Design:</strong> Cookies are minimized by default</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Other Jurisdictions</h3>
                <p>We also comply with applicable laws in other regions including Nigeria (NDPR), Kenya (Data Protection Act 2019), and South Africa (POPIA).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">7. Managing Your Cookie Preferences</h2>
            <p className="text-gray-600 mb-4">You have several options to manage or disable cookies:</p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Browser Settings</h3>
                <p className="text-gray-600 text-sm mb-2">Most web browsers allow you to:</p>
                <ul className="list-disc list-inside text-gray-600 text-sm ml-2 space-y-1">
                  <li>View what cookies are stored on your device</li>
                  <li>Delete all or specific cookies</li>
                  <li>Block all or certain types of cookies</li>
                  <li>Set preferences for certain websites</li>
                  <li>Receive notifications when cookies are placed</li>
                </ul>
                <p className="text-gray-600 text-sm mt-2">
                  <strong>Note:</strong> Disabling essential cookies may affect website functionality.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Our Cookie Consent Manager</h3>
                <p className="text-gray-600 text-sm">
                  You can update your preferences at any time by clicking the "Cookie Settings" link in our website footer 
                  or clearing your consent through our preference center.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Opt-Out Links</h3>
                <p className="text-gray-600 text-sm mb-2">You can opt out of specific third-party cookies:</p>
                <ul className="list-disc list-inside text-gray-600 text-sm ml-2 space-y-1">
                  <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Google Analytics Opt-out</a></li>
                  <li><a href="https://www.facebook.com/ads/settings" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Facebook Ad Preferences</a></li>
                  <li>Your Online Choices (EU): <a href="http://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">youronlinechoices.com</a></li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">8. Cookie Retention Period</h2>
            <p className="text-gray-600 mb-4">Cookies periods depending are retained for different on their purpose:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Short-Term Analytics:</strong> 24 hours to 7 days</li>
              <li><strong>Functional Cookies:</strong> 30 days to 1 year</li>
              <li><strong>Marketing Cookies:</strong> 3 months to 2 years</li>
              <li><strong>Security Cookies:</strong> Duration of session plus security tokens</li>
            </ul>
            <p className="text-gray-600 mt-4">
              We regularly review and delete cookies that are no longer needed in accordance with our data retention policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">9. Your Rights Regarding Cookies</h2>
            <p className="text-gray-600 mb-4">Under various privacy laws, you have the following rights:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border p-4 rounded">
                <h3 className="font-medium text-gray-800 mb-2">Right to Information</h3>
                <p className="text-sm text-gray-600">You have the right to be informed about what cookies we use and why.</p>
              </div>
              <div className="border p-4 rounded">
                <h3 className="font-medium text-gray-800 mb-2">Right to Consent</h3>
                <p className="text-sm text-gray-600">You can choose whether or not to accept non-essential cookies.</p>
              </div>
              <div className="border p-4 rounded">
                <h3 className="font-medium text-gray-800 mb-2">Right to Withdraw</h3>
                <p className="text-sm text-gray-600">You can withdraw consent at any time through browser settings or our preference center.</p>
              </div>
              <div className="border p-4 rounded">
                <h3 className="font-medium text-gray-800 mb-2">Right to Access</h3>
                <p className="text-sm text-gray-600">You can request information about cookies we have stored about you.</p>
              </div>
            </div>
            <p className="text-gray-600 mt-4">
              To exercise these rights, please contact our Data Protection Officer at <span className="text-red-600">dpo@lockerroom.com</span>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">10. Updates to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices, technology, or legal requirements. 
              We will notify you of any material changes by posting the updated policy on this page and updating the "Last updated" date. 
              We encourage you to review this policy periodically to stay informed about how we use cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">11. Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                If you have any questions, concerns, or requests regarding this Cookie Policy or our use of cookies, 
                please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>LockerRoom</strong></p>
                <p>Data Protection Officer</p>
                <p>Email: dpo@lockerroom.com</p>
                <p>Phone: +233 123 456 789</p>
                <p>Address: Accra, Ghana</p>
              </div>
              <p className="text-gray-600 mt-4">
                For EU users, you also have the right to lodge a complaint with your local data protection authority.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-4">
          <Link to="/privacy-policy" className="text-red-600 hover:underline">
            &larr; Privacy Policy
          </Link>
          <span className="hidden sm:inline text-gray-400">|</span>
          <Link to="/" className="text-red-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CookiePolicy
