
const HelpCenter = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">How do I get started?</h3>
              <p className="text-muted-foreground">Click on the Get Started button and create your account to begin your learning journey.</p>
            </div>
            {/* Add more FAQs as needed */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
