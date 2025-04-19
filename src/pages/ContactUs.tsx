
const ContactUs = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="max-w-2xl">
        <p className="text-muted-foreground mb-8">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Contact Information:</h2>
          <div>
            <p>Email: support@padhleBhai.com</p>
            <p>Location: Mumbai, India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
