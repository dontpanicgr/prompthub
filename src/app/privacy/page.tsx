import MainLayout from '@/components/layout/main-layout'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="w-full">
        <div className="max-w-4xl mx-auto p-6">
          {/* Back Button */}
          <Link href="/">
            <Button variant="outline" className="mb-8">
              <ArrowLeft size={18} className="mr-2" />
              Back to Home
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="mb-4">
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
              </p>
              
              <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Name and email address when you register for an account</li>
                <li>Profile information you choose to provide</li>
                <li>Content you create, such as prompts, comments, and reviews</li>
                <li>Communications with us, including support requests</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Usage Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Information about how you use our Service</li>
                <li>Device information, including IP address, browser type, and operating system</li>
                <li>Log information, including access times and pages viewed</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect, investigate, and prevent security incidents</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
              <p className="mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold mb-3">Public Information</h3>
              <p className="mb-4">
                When you create public prompts or profiles, this information may be visible to other users of the Service.
              </p>

              <h3 className="text-xl font-semibold mb-3">Service Providers</h3>
              <p className="mb-4">
                We may share your information with third-party service providers who assist us in operating our Service, such as:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Cloud hosting providers (Supabase)</li>
                <li>Analytics services</li>
                <li>Email delivery services</li>
                <li>Customer support tools</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Legal Requirements</h3>
              <p className="mb-4">
                We may disclose your information if required to do so by law or in response to valid requests by public authorities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
              <p className="mb-4">
                Our security measures include:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication</li>
                <li>Monitoring for suspicious activity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
              <p className="mb-4">
                We retain your personal information for as long as necessary to provide our Service and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <p className="mb-4">
                When you delete your account, we will delete or anonymize your personal information, though some information may be retained for legitimate business purposes or legal compliance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
              <p className="mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to collect and use personal information about you. Cookies are small data files that are placed on your device when you visit our Service.
              </p>
              <p className="mb-4">
                We use cookies for:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Authentication and security</li>
                <li>Remembering your preferences</li>
                <li>Analyzing usage patterns</li>
                <li>Improving our Service</li>
              </ul>
              <p className="mb-4">
                You can control cookies through your browser settings, but disabling cookies may affect the functionality of our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services</h2>
              <p className="mb-4">
                Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies before providing any personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="mb-4">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p>Email: privacy@prompthub.com</p>
                <p>Address: [Your Company Address]</p>
                <p>Phone: [Your Phone Number]</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Regional Privacy Rights</h2>
              
              <h3 className="text-xl font-semibold mb-3">California Residents (CCPA)</h3>
              <p className="mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act, including the right to know what personal information we collect, the right to delete personal information, and the right to opt-out of the sale of personal information.
              </p>

              <h3 className="text-xl font-semibold mb-3">European Union Residents (GDPR)</h3>
              <p className="mb-4">
                If you are in the European Union, you have additional rights under the General Data Protection Regulation, including the right to access, rectify, erase, restrict, port, and object to the processing of your personal data.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
