import { CallToAction } from "@/components/home/call-to-action";
import { Faq } from "@/components/home/faq";
import { Hero } from "@/components/home/hero";
import { ServicesGrid } from "@/components/home/services-grid";
import { Testimonials } from "@/components/home/testimonials";
import { WhyChoose } from "@/components/home/why-choose";
import { faqs } from "@/lib/content";
import { faqJsonLd } from "@/lib/structured-data";

const faqMarkup = faqJsonLd(faqs);

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqMarkup) }}
      />

      <Hero />
      <ServicesGrid />
      <WhyChoose />
      <Testimonials />
      <Faq limit={4} moreHref="/faq" />
      <CallToAction />
    </>
  );
}
