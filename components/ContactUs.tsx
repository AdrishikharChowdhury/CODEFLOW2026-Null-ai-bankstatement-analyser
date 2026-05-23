import { team } from "@/lib/constants";
import { Mail } from "lucide-react";
import Image from "next/image";

const ContactUs = () => {
  return (
    <main
      className="w-full min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-20 bg-green-pea-1600"
      id="contact-us"
    >
        <h2 className="text-5xl font-bold tracking-tight">Contact Us</h2>
      <div className="flex lg:flex-row gap-16 w-full max-w-6xl h-full items-center">
        
        <div className="flex flex-col gap-4 text-center lg:text-left max-w-xl h-full">
          <p className="text-green-pea-200 text-lg/12 tracking-widest text-center">
            We are always open to questions, collaborations, or just a friendly
            conversation. Whether you have feedback about Financialo, want to
            report an issue, or are interested in contributing to the project —
            do not hesitate to reach out.
          </p>
          
          <p className="text-green-pea-200 text-base/10 tracking-widest text-center">
            Each member of Team Null brings unique expertise — from machine
            learning and full-stack development to database architecture and
            team leadership. We are passionate about building tools that make
            financial data accessible to everyone.
          </p>
          <p className="text-green-pea-300 text-base/8 tracking-widest text-center">
            Click the mail icon on any team member&apos;s card below to send a
            direct message. We typically respond within 24 hours.
          </p>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
        {team.map((member) => (
          <div
            key={member.name}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-green-pea-700 bg-green-pea-1800/60 p-8 transition-all duration-300 hover:border-green-pea-400 hover:shadow-[0_0_30px_-8px] hover:shadow-green-pea-400/30 justify-between"
          >
            <div className="aspect-square w-28 overflow-hidden rounded-full border-2 border-green-pea-600 transition-transform duration-300 group-hover:scale-105">
              <Image
                src={member.imgPath}
                width={112}
                height={112}
                className="object-cover h-full w-full"
                alt={member.name}
              />
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-lg font-semibold text-green-pea-50">
                {member.name}
              </h3>
              <p className="text-sm font-medium text-green-pea-400">
                {member.role}
              </p>
            </div>

            <a
              href={`mailto:${member.email}`}
              className="flex items-center justify-center rounded-full border border-green-pea-600 p-3 text-green-pea-400 transition-colors hover:border-green-pea-400 hover:bg-green-pea-800/50 hover:text-green-pea-100"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        ))}
      </div>
      </div>
    </main>
  );
};

export default ContactUs;
