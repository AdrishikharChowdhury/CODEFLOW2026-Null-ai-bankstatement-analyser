import AboutUs from "@/components/AboutUs";
import Banner from "@/components/Banner";
import ContactUs from "@/components/ContactUs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const page = () => {
  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Navbar />
      <Banner />
      <section>
        <AboutUs />
      </section>
      <section>
        <ContactUs />
      </section>
      <Footer />
    </div>
  );
};

export default page;
