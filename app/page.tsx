import { CallToAction } from "@/components/home/call-to-action";
import { Capabilities } from "@/components/home/capabilities";
import { Contact } from "@/components/home/contact";
import { EstimateSection } from "@/components/home/estimate-section";
import { Faq } from "@/components/home/faq";
import { Hero } from "@/components/home/hero";
import { PhotoBand } from "@/components/home/photo-band";
import { Pricing } from "@/components/home/pricing";
import { Process } from "@/components/home/process";
import { Ticker } from "@/components/home/ticker";
import { OurPromise } from "@/components/home/our-promise";
import { Quote } from "@/components/home/quote";
import { Testimonials } from "@/components/home/testimonials";
import { faqs } from "@/lib/content";
import { atmospherePhotos } from "@/lib/media";
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
      <Ticker />
      <Capabilities />
      <Process />

      <PhotoBand
        photo={atmospherePhotos.bench}
        overlay="Dibongkar"
        className="h-[46svh] min-h-[280px] md:h-[62svh]"
      />

      <EstimateSection />
      <Pricing />
      <OurPromise />
      <Quote />
      <Testimonials />
      <Faq />

      <PhotoBand
        photo={atmospherePhotos.board}
        className="h-[34svh] min-h-[220px]"
      />

      <Contact />
      <CallToAction />
    </>
  );
}
