import AboutUs from "@/components/AboutUs";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";

const page = () => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Banner />
      <main>
        <AboutUs />
      </main>
    </div>
  )
}

export default page
