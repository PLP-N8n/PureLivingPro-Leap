import { SEOHead } from "../components/SEOHead";
import { Breadcrumbs } from "../components/Breadcrumbs";

export function TermsPage() {
  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="Read the terms of service for using the Pure Living Pro website and its services."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Terms of Service" }]} />
        </div>
        <div className="prose lg:prose-xl">
          <h1>Terms of Service</h1>
          <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Terms</h2>
          <p>
            By accessing the website at https://purelivingpro.com, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
          </p>
          
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Pure Living Pro's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on Pure Living Pro's website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
          <p>
            This license shall automatically terminate if you violate any of these restrictions and may be terminated by Pure Living Pro at any time.
          </p>
          
          <h2>3. Disclaimer</h2>
          <p>
            The materials on Pure Living Pro's website are provided on an 'as is' basis. Pure Living Pro makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          <p>
            The content on this site is for informational and educational purposes only and is not intended as medical advice or to replace a relationship with a qualified healthcare professional.
          </p>
          
          <h2>4. Limitations</h2>
          <p>
            In no event shall Pure Living Pro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Pure Living Pro's website, even if Pure Living Pro or a Pure Living Pro authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
          
          <h2>5. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of California and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </div>
      </div>
    </>
  );
}
