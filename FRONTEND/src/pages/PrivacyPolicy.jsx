import React from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'Privacy Policy' }]} />
      
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: March 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              At LockerRoom, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our e-commerce platform.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This policy is compliant with Ghana's Data Protection Act, 2012 (Act 843), the General Data Protection Regulation (GDPR), 
              and other applicable international privacy laws. By using our services, you consent to the practices described herein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">2. Information We Collect</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Full name (first and last)</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Shipping and billing addresses</li>
                  <li>Payment information (processed securely through our payment partners)</li>
                  <li>Date of birth (for account verification)</li>
                  <li>Profile picture (optional)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Access times and dates</li>
                  <li>Pages viewed and interaction data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use your personal information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
              <li>Processing and fulfilling your orders</li>
              <li>Providing customer support and responding to inquiries</li>
              <li>Sending order confirmations, shipping updates, and delivery notifications</li>
              <li>Processing payments and preventing fraud</li>
              <li>Personalizing your shopping experience</li>
              <li>Marketing and promotional communications (with your consent)</li>
              <li>Improving our website, products, and services</li>
              <li>Complying with legal obligations</li>
              <li>Account verification and security purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">4. Information Sharing & Disclosure</h2>
            <p className="text-gray-600 mb-4">
              We may share your information with third parties only in the following circumstances:
            </p>
            <div className="space-y-3 text-gray-600">
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium text-gray-800">Service Providers</h3>
                <p>We share data with trusted third-party service providers who assist us in operating our website, 
                processing payments, fulfilling orders, and delivering products. These parties are bound by confidentiality agreements.</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium text-gray-800">Payment Processing</h3>
                <p>Payment information is processed securely through licensed payment processors. We do not store 
                your complete credit/debit card details on our servers.</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium text-gray-800">Legal Compliance</h3>
                <p>We may disclose information when required by law, regulation, or court order, or when necessary 
                to protect our rights, safety, or the safety of others.</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium text-gray-800">Business Transfers</h3>
                <p>In the event of a merger, acquisition, or sale of assets, your personal information may be 
                transferred as part of that transaction.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">5. Data Protection (Ghana & International Compliance)</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Ghana Data Protection Act, 2012 (Act 843)</h3>
                <p>We comply with Ghana's Data Protection Act, which requires:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>Lawful basis for processing personal data</li>
                  <li>Collection of data for specified, explicit purposes</li>
                  <li>Data accuracy and relevance</li>
                  <li>Secure storage and limited retention</li>
                  <li>Rights of data subjects (you)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">GDPR Compliance (European Union)</h3>
                <p>For users in the EU, we additionally comply with GDPR requirements including:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                  <li>Right to access personal data</li>
                  <li>Right to rectification (correct inaccurate data)</li>
                  <li>Right to erasure ("right to be forgotten")</li>
                  <li>Right to data portability</li>
                  <li>Right to object to processing</li>
                  <li>Right to restrict processing</li>
                  <li>Withdrawal of consent at any time</li>
                  <li>Lodging complaints with supervisory authorities</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">6. Data Security</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure socket layer (SSL) technology for payment processing</li>
              <li>Encrypted storage of sensitive personal data</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-gray-600 mt-4">
              While we strive to protect your personal information, no method of transmission over the Internet is 
              100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">7. Cookies & Tracking Technologies</h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar tracking technologies to enhance your browsing experience. By using our website, 
              you consent to the use of these technologies.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-gray-600">
              <div className="border p-4 rounded">
                <h3 className="font-medium text-gray-800 mb-2">Essential Cookies</h3>
                <p className="text-sm">Required for basic site functionality, shopping cart, and checkout process.</p>
              </div>
              <div className="border p-4 rounded">
                <h3 className="font-medium text-gray-800 mb-2">Analytics Cookies</h3>
                <p className="text-sm">Help us understand how visitors navigate and use our site to improve functionality.</p>
              </div>
              <div className="border p-4 rounded">
                <h3 className="font-medium text-gray-800 mb-2">Marketing Cookies</h3>
                <p className="text-sm">Used to deliver personalized advertisements based on your interests.</p>
              </div>
              <div className="border p-4 rounded">
                <h3 className="font-medium text-gray-800 mb-2">Preference Cookies</h3>
                <p className="text-sm">Remember your settings and preferences for a personalized experience.</p>
              </div>
            </div>
            <p className="text-gray-600 mt-4">
              You can manage or disable cookies through your browser settings. However, disabling essential cookies 
              may affect website functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">8. Your Rights</h2>
            <div className="space-y-3 text-gray-600">
              <p>Under both Ghana's Data Protection Act and GDPR, you have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Objection:</strong> Object to processing of your data for marketing purposes</li>
                <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
                <li><strong>Restriction:</strong> Request restriction of processing while disputes are resolved</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, please contact our Data Protection Officer at: 
                <span className="text-red-600"> dpo@lockerroom.com</span>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">9. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We retain your personal information only for as long as necessary to fulfill the purposes for which we 
              collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
              <li><strong>Account data:</strong> Retained while your account is active and for 2 years after closure</li>
              <li><strong>Order data:</strong> Retained for 5 years for tax and legal compliance purposes</li>
              <li><strong>Marketing data:</strong> Retained until you withdraw consent</li>
              <li><strong>Log data:</strong> Retained for 12 months for security purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">10. Third-Party Links</h2>
            <p className="text-gray-600 leading-relaxed">
              Our website may contain links to third-party websites, services, or applications that are not operated 
              by us. We are not responsible for the privacy practices of these third parties. We encourage you to 
              review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">11. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our services are not intended for individuals under the age of 16. We do not knowingly collect personal 
              information from children. If you become aware that a child has provided us with personal data without 
              parental consent, please contact us immediately. We will take steps to remove such information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">12. International Data Transfers</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. 
              These countries may have different data protection laws. When we transfer data internationally, we 
              implement appropriate safeguards to protect your information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              <li>Binding Corporate Rules for intra-group transfers</li>
              <li>Adequacy decisions where available</li>
              <li>Additional security measures for data protection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">13. Marketing Communications</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              With your consent, we may send you marketing communications about our products, services, special offers, 
              and promotions. You can opt-out at any time by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
              <li>Clicking the "unsubscribe" link in any marketing email</li>
              <li>Contacting our customer support</li>
              <li>Updating your account preferences</li>
            </ul>
            <p className="text-gray-600 mt-4">
              We will respect your choice and stop sending marketing communications within 10 business days of your request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">14. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, 
              or legal requirements. We will notify you of any material changes by posting the new policy on this 
              page and updating the "Last updated" date. We encourage you to review this policy periodically to 
              stay informed about how we protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-red-600">15. Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
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
                For GDPR-related complaints, you also have the right to lodge a complaint with the Ghana Data Protection Commission 
                or your local supervisory authority.
              </p>
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

export default PrivacyPolicy
