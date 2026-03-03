import React from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'

const TermsConditions = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'Terms & Conditions' }]} />
      
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-gray-500 mb-8">Last updated: March 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Welcome to LockerRoom. These Terms and Conditions ("Terms") constitute a legally binding agreement between 
              you ("Customer," "you," or "your") and LockerRoom ("Company," "we," "us," or "our") governing your access 
              to and use of our e-commerce platform.
            </p>
            <p className="text-gray-600 leading-relaxed">
              By accessing, browsing, or using our website, you acknowledge that you have read, understood, and agree 
              to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">2. Account Registration & Eligibility</h2>
            <div className="space-y-4 text-gray-600">
              <p>To make purchases on our platform, you must create an account. By registering, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be at least 16 years of age or have parental/guardian consent</li>
              </ul>
              <p className="mt-4">
                We reserve the right to suspend or terminate accounts that violate these terms or for any other reason at our sole discretion.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">3. Products & Pricing</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Product Descriptions</h3>
                <p>We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions, images, pricing, or other content on our website is accurate, complete, reliable, current, or error-free.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Pricing</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>All prices are listed in Ghana Cedis (GHS) unless otherwise specified</li>
                  <li>Prices may vary based on location and currency selection</li>
                  <li>We reserve the right to change prices at any time without notice</li>
                  <li>Promotional discounts and offers are subject to specific terms</li>
                  <li>Price errors may be corrected at our discretion</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Product Availability</h3>
                <p>Products are subject to availability. In the event an item is out of stock, we will notify you and offer alternatives or a full refund.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">4. Orders & Payment</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Order Processing</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>All orders are subject to acceptance and confirmation</li>
                  <li>We reserve the right to refuse or cancel any order for any reason</li>
                  <li>Order confirmation does not constitute acceptance of the order</li>
                  <li>Contract is formed when we ship the items or send confirmation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Payment Methods</h3>
                <p>We accept the following payment methods:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>Credit/Debit Cards (Visa, Mastercard, Amex)</li>
                  <li>Mobile Money (MTN, Vodafone, AirtelTigo)</li>
                  <li>Bank Transfers</li>
                  <li>Cash on Delivery (where available)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Payment Security</h3>
                <p>All payment transactions are processed through secure, encrypted connections. We comply with Ghana's Payment Systems and Services Act and international PCI-DSS standards.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">5. Shipping & Delivery</h2>
            <div className="space-y-4 text-gray-600">
              <p>Shipping terms are governed by our Shipping Policy. Key points include:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Delivery Time:</strong> Standard delivery within 3-7 business days; Express delivery available</li>
                <li><strong>Shipping Costs:</strong> Free shipping on orders over GHS 500</li>
                <li><strong>Delivery Areas:</strong> We deliver across Ghana and select international locations</li>
                <li><strong>Risk of Loss:</strong> Risk passes to you upon delivery to the carrier</li>
                <li><strong>Tracking:</strong> Tracking numbers provided for all shipped orders</li>
              </ul>
              <p className="mt-4">
                For international orders, you are responsible for customs duties, taxes, and import fees per your country's regulations.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">6. Returns, Refunds & Exchanges</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Return Policy (Ghana & Consumer Protection)</h3>
                <p>Under Ghana's Consumer Protection Act, 2019 (Act 988) and international standards, we offer:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>30-day return window for most items</li>
                  <li>Items must be unused, in original packaging, with tags attached</li>
                  <li>Proof of purchase required</li>
                  <li>Refunds processed within 14 business days</li>
                  <li>Exchange options available for different sizes/colors</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Non-Returnable Items</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Intimate apparel, swimwear, and underwear</li>
                  <li>Personal care items (if opened)</li>
                  <li>Customized or personalized products</li>
                  <li>Digital products and gift cards</li>
                  <li>Items damaged due to misuse</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Refund Process</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Refunds are issued to original payment method</li>
                  <li>Original shipping fees may not be refunded</li>
                  <li>Return shipping costs may apply (unless defective)</li>
                  <li>Refunds exclude any duties/taxes for international orders</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">7. User Conduct & Prohibited Activities</h2>
            <p className="text-gray-600 mb-4">When using our website, you agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Post or transmit harmful, threatening, abusive, or hateful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the site for commercial purposes without authorization</li>
              <li>Interfere with the proper operation of the website</li>
              <li>Engage in any activity that could damage, disable, or burden our servers</li>
              <li>Copy, modify, or distribute our proprietary content</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Violation of these terms may result in account termination and legal action.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">8. Intellectual Property</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Our Rights</h3>
                <p>All content on our website, including logos, designs, text, graphics, images, software, and other materials, are owned by LockerRoom or our licensors and are protected by Ghana's Copyright Act, 2005 (Act 690) and international copyright laws.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Restrictions</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>No part of the website may be reproduced without written permission</li>
                  <li>Trademarks may not be used without authorization</li>
                  <li>You may not create derivative works from our content</li>
                  <li>Automated scraping or data mining is prohibited</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">9. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-600">
              <p>To the maximum extent permitted by law:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Our services are provided "as is" without warranties of any kind</li>
                <li>We do not guarantee that the website will be error-free or uninterrupted</li>
                <li>We shall not be liable for indirect, incidental, consequential, or punitive damages</li>
                <li>Our total liability shall not exceed the amount paid for the products in question</li>
                <li>We are not liable for acts of third parties, including delivery partners</li>
              </ul>
              <p className="mt-4">
                Some jurisdictions may not allow these limitations, so they may not apply to you.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">10. Indemnification</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You agree to indemnify, defend, and hold harmless LockerRoom, its officers, directors, employees, 
              agents, and affiliates from and against any claims, liabilities, damages, losses, costs, or expenses 
              (including reasonable attorneys' fees) arising out of or related to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
              <li>Your use of our website or services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your User Content</li>
              <li>Your interaction with other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">11. Dispute Resolution</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Ghana Jurisdiction</h3>
                <p>These Terms are governed by the laws of Ghana. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Ghana.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Consumer Disputes</h3>
                <p>For consumer disputes, you may also seek resolution through:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>Ghana Consumer Protection Agency (CPA)</li>
                  <li>Small Claims Court for minor disputes</li>
                  <li>Alternative Dispute Resolution (ADR) mechanisms</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">International Users</h3>
                <p>For international users, disputes may be governed by applicable local laws. However, you agree that any legal proceedings will be brought exclusively in Ghana unless mandatory consumer protection laws in your jurisdiction require otherwise.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">12. Privacy & Data Protection</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Your privacy is important to us. By using our services, you agree to the collection, use, and 
              processing of your personal data as described in our <Link to="/privacy-policy" className="text-red-600 hover:underline">Privacy Policy</Link>.
            </p>
            <p className="text-gray-600">
              We comply with Ghana's Data Protection Act, 2012 (Act 843) and GDPR for international users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">13. Third-Party Links & Services</h2>
            <div className="space-y-4 text-gray-600">
              <p>Our website may contain links to third-party websites, services, or applications that are not owned or controlled by LockerRoom:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>We are not responsible for the content or practices of third-party sites</li>
                <li>Third-party services are governed by their own terms and policies</li>
                <li>We do not endorse or guarantee third-party products or services</li>
                <li>Your interactions with third parties are solely between you and them</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">14. Modifications to Service & Terms</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Service Modifications</h3>
                <p>We reserve the right to modify, suspend, or discontinue any part of our services at any time without notice.</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Terms Updates</h3>
                <p>We may update these Terms from time to time. Changes will be posted on this page with an updated "Last modified" date. Your continued use of the website after changes constitutes acceptance of the new Terms.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">15. Force Majeure</h2>
            <p className="text-gray-600 leading-relaxed">
              We shall not be liable for any failure or delay in performing our obligations where such failure or delay results 
              from events beyond our reasonable control, including but not limited to acts of God, natural disasters, 
              war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, strikes, 
              or shortages of transportation, facilities, fuel, energy, labor, or materials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">16. Severability</h2>
            <p className="text-gray-600 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, such provision shall be limited 
              or eliminated to the minimum extent necessary so that the remaining provisions will continue in full force 
              and effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">17. Entire Agreement</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms, together with our Privacy Policy, Shipping Policy, Return Policy, and any other policies 
              referenced herein, constitute the entire agreement between you and LockerRoom regarding your use of our 
              website and supersede all prior agreements and understandings, whether written or oral.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">18. Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                If you have any questions, concerns, or requests regarding these Terms, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>LockerRoom</strong></p>
                <p>Email: legal@lockerroom.com</p>
                <p>Phone: +233 123 456 789</p>
                <p>Address: Accra, Ghana</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t">
          <Link to="/" className="text-red-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TermsConditions
