import Hero from "../components/Hero";
import Features from "../components/Features";
import Integration from "../components/Integration";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <main className="min-h-screen bg-custom-black text-white font-inter">
      <Hero />
      <Features />
      <Integration />
      <Testimonials />
      <Footer />
    </main>
  );
};

export default LandingPage;
