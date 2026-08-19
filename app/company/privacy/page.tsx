import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Privacy Policy</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Privacy Policy & Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Last updated: January 1, 2024</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10 prose prose-sm dark:prose-invert max-w-none">
        {[
          {
            title: "1. Information We Collect",
            body: "We collect information you provide directly to us, such as when you create an account, schedule a service appointment, make a purchase, or contact us. This may include your name, email address, phone number, postal address, payment information, vehicle information, and any other information you choose to provide."
          },
          {
            title: "2. How We Use Your Information",
            body: "We use the information we collect to process transactions, provide customer service, send transactional and promotional communications, analyze usage patterns to improve our services, and comply with legal obligations."
          },
          {
            title: "3. Information Sharing",
            body: "We do not sell your personal information to third parties. We may share your information with service providers who assist in our operations (payment processors, shipping carriers, email providers), and as required by law."
          },
          {
            title: "4. Data Security",
            body: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment transactions are encrypted using SSL technology. We retain personal data only as long as necessary for the purposes described in this policy."
          },
          {
            title: "5. Cookies & Tracking",
            body: "We use cookies and similar tracking technologies to enhance your browsing experience, remember your preferences (including your saved vehicle selection), analyze site traffic, and serve relevant advertisements. You can control cookie settings through your browser preferences."
          },
          {
            title: "6. Your Rights",
            body: "Depending on your location, you may have the right to access, correct, or delete your personal data. To exercise these rights, contact us at " + siteConfig.emailPrivacy + ". We will respond to all requests within 30 days."
          },
          {
            title: "7. Terms of Service",
            body: "By using our website, you agree to these terms. Our website and its content are provided 'as is' without warranties of any kind. We reserve the right to modify pricing, availability, and specifications without notice. All sales are subject to our standard purchase agreement. We are not responsible for typographical errors."
          },
          {
            title: "8. Contact Us",
            body: `For privacy-related inquiries, contact us at: ${siteConfig.name}, ${siteConfig.address.line}. Email: ${siteConfig.emailPrivacy}. Phone: ${siteConfig.phone}.`
          },
        ].map(({ title, body }) => (
          <section key={title} className="mb-8">
            <h2 className="text-lg font-bold mb-3">{title}</h2>
            <p className="text-foreground/80 leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
