
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: April 19, 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              PadhleBhai is committed to protecting your privacy. This Privacy Policy explains how we collect,
              use, and safeguard your personal information when you use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Account information (name, email, educational institution)</li>
              <li>Course progress and performance data</li>
              <li>Quiz and assessment results</li>
              <li>User-generated content and discussions</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
