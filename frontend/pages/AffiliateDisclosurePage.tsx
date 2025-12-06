import { SEOHead } from "../components/SEOHead";
import { Breadcrumbs } from "../components/Breadcrumbs";

export function AffiliateDisclosurePage() {
  return (
    <>
      <SEOHead
        title="Affiliate Disclosure"
        description="Learn about our affiliate partnerships and how we earn commissions at Pure Living Pro."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Affiliate Disclosure" }]} />
        </div>
        <div className="prose lg:prose-xl">
          <h1>Affiliate Disclosure</h1>
          <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            At Pure Living Pro, our mission is to provide you with the best content and product recommendations to support your wellness journey. To help us fund our research and content creation, we participate in various affiliate marketing programs.
          </p>
          
          <h2>What is an Affiliate Link?</h2>
          <p>
            When you click on a link on our site that leads to a product or service on another website (like Amazon.co.uk), that link may be an "affiliate link." This means that if you end up purchasing the product, we may receive a small commission from the retailer at no extra cost to you.
          </p>
          
          <h2>Our Commitment to You</h2>
          <p>
            Our recommendations are always based on our own research, expert opinions, and belief in the quality and value of the product or service. We are independently owned, and the opinions expressed here are our own.
          </p>
          <ul>
            <li>We only recommend products we genuinely believe will be beneficial to our readers.</li>
            <li>Our editorial content is not influenced by advertisers or affiliate partnerships.</li>
            <li>The commission we earn helps us keep Pure Living Pro running and allows us to continue providing high-quality, free content.</li>
          </ul>
          
          <h2>Amazon Associates Program</h2>
          <p>
            Pure Living Pro is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.co.uk.
          </p>
          
          <p>
            Thank you for your support. It allows us to continue our mission of promoting a healthier, more mindful world. If you have any questions, please don't hesitate to contact us.
          </p>
        </div>
      </div>
    </>
  );
}
