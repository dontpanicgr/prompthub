import MainLayout from '@/components/layout/main-layout'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
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
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using Lexee ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="mb-4">
                Lexee is a platform that allows users to discover, share, and manage AI prompts. The Service enables users to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Create and share AI prompts</li>
                <li>Discover prompts created by other users</li>
                <li>Organize and manage their personal prompt collection</li>
                <li>Rate and review prompts</li>
                <li>Follow other users and their prompt collections</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="mb-4">
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information to keep it accurate, current, and complete</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. User Content and Conduct</h2>
              <p className="mb-4">
                You are responsible for all content you post, upload, or otherwise make available through the Service. You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Post content that is illegal, harmful, threatening, abusive, or defamatory</li>
                <li>Post content that infringes on intellectual property rights</li>
                <li>Post content that contains malware, viruses, or other harmful code</li>
                <li>Impersonate any person or entity or misrepresent your affiliation with a person or entity</li>
                <li>Spam or post repetitive content</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property Rights</h2>
              <p className="mb-4">
                The Service and its original content, features, and functionality are owned by Lexee and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
              <p className="mb-4">
                You retain ownership of the content you create and share through the Service. By posting content, you grant Lexee a non-exclusive, royalty-free, worldwide license to use, display, and distribute your content in connection with the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Privacy Policy</h2>
              <p className="mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Prohibited Uses</h2>
              <p className="mb-4">
                You may not use our Service:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
              <p className="mb-4">
                We strive to maintain the Service's availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or technical issues.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Disclaimer of Warranties</h2>
              <p className="mb-4">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Lexee and its suppliers and licensors hereby disclaim all warranties of any kind, whether express or implied, statutory, or otherwise, including but not limited to any warranties of merchantability, non-infringement, and fitness for a particular purpose.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Limitation of Liability</h2>
              <p className="mb-4">
                In no event shall Lexee, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be interpreted and governed by the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p>Email: legal@lexee.com</p>
                <p>Address: [Your Company Address]</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
