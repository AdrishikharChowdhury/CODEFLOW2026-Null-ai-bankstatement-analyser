import AboutUs from "@/components/AboutUs";
import Banner from "@/components/Banner";
import ContactUs from "@/components/ContactUs";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { LandingPageWrapper } from "@/components/LandingPageWrapper";

const page = () => {
  return (
    <LandingPageWrapper>
      <div className="w-full min-h-screen flex flex-col dark:bg-indigo-950">
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
    </LandingPageWrapper>
  );
};

export default page;
