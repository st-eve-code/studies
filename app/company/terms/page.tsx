import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Terms of Service & Copyright</span>
          </div>
          <h1 className="text-3xl font-black mb-2">Terms of Service & Copyright Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: January 1, 2024</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10 prose prose-sm dark:prose-invert max-w-none">
        {[
          {
            title: "1. Acceptance of Terms",
            body: "By accessing or using this website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use the website. We may update these terms at any time without notice."
          },
          {
            title: "2. Copyright Ownership",
            body: "All content on this website — including vehicle listings, product descriptions, photographs, images, logos, text, graphics, pricing information, and software code — is the exclusive property of Xtreme Powersports Inc. and its licensors, and is protected by United States and international copyright laws."
          },
          {
            title: "3. No Unauthorized Copying",
            body: "You may NOT copy, reproduce, republish, upload, post, transmit, scrape, download, frame, or otherwise duplicate any portion of this website — in whole or in part — for any purpose, commercial or otherwise, without the prior written permission of Xtreme Powersports Inc. This includes automated collection of listings, images, pricing, or specifications by bots, scrapers, or any data-extraction tool. We reserve the right to block any automated or manual access that violates this policy."
          },
          {
            title: "4. Limited Personal Use",
            body: "You may view, print, and save individual pages of this website for your own personal, non-commercial reference (for example, to research a vehicle you are considering for purchase). Any other use, including republication of our vehicle photos or specifications on third-party sites, requires our written consent."
          },
          {
            title: "5. Trademarks",
            body: "Vehicle manufacturer names, model names, logos, and product designs displayed on this website are the property of their respective owners. Reference to them does not imply sponsorship or endorsement. All other trademarks, service marks, and trade names are the property of Xtreme Powersports Inc."
          },
          {
            title: "6. Reporting Copyright Infringement",
            body: "If you believe content on this website infringes your copyright, please contact our designated agent at copyright@xtremepowersports.com with the following information: identification of the copyrighted work, the infringing material's location, your contact information, and a statement of good-faith belief that the use is not authorized. We respond to valid claims promptly and remove infringing material when confirmed."
          },
          {
            title: "7. Limitation of Liability",
            body: "Our website and its content are provided 'as is' without warranties of any kind. We reserve the right to modify pricing, availability, and specifications without notice. All sales are subject to our standard purchase agreement. We are not responsible for typographical errors or manufacturer-sourced data. Vehicle photos may vary from the actual unit in stock."
          },
          {
            title: "8. Contact Us",
            body: "For questions about this policy or to request permission to use our content, contact us at: Xtreme Powersports Inc., 1234 Powersports Blvd, Columbus, OH 43215. Email: copyright@xtremepowersports.com. Phone: (614) 555-0199."
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
