
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: April 19, 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Terms</h2>
            <p className="text-muted-foreground">
              By accessing this website, you are agreeing to be bound by these Terms and Conditions of Use,
              all applicable laws and regulations, and agree that you are responsible for compliance with any
              applicable local laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="text-muted-foreground">
              Permission is granted to temporarily download one copy of the materials (information or software)
              on PadhleBhai's website for personal, non-commercial transitory viewing only.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
