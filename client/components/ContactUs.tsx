import { team } from "@/lib/constants";
import { Mail } from "lucide-react";
import Image from "next/image";

const ContactUs = () => {
  return (
    <section
      className="w-full min-h-screen flex flex-col items-center justify-center gap-12 px-6 py-24 bg-background relative overflow-hidden"
      id="contact-us"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="flex flex-col items-center gap-4 text-center">
        <div className="inline-block px-4 py-1.5 text-sm font-semibold tracking-wide text-primary uppercase bg-primary/10 rounded-full">
          Get In Touch
        </div>
        <h2 className="text-5xl font-bold tracking-tight text-foreground">Contact Us</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 w-full max-w-6xl items-center relative z-10">
        <div className="flex flex-col gap-6 text-center lg:text-left max-w-xl">
          <p className="text-muted-foreground text-lg leading-relaxed">
            We are always open to questions, collaborations, or just a friendly
            conversation. Whether you have feedback about Financialo, want to
            report an issue, or are interested in contributing to the project —
            do not hesitate to reach out.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Each member of Team Null brings unique expertise — from machine
            learning and full-stack development to database architecture and
            team leadership. We are passionate about building tools that make
            financial data accessible to everyone.
          </p>
          <div className="flex items-center gap-4 justify-center lg:justify-start mt-4">
            <div className="flex -space-x-3">
              {team.map((member) => (
                <div key={member.name} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                   <Image src={member.imgPath} width={40} height={40} className="object-cover h-full w-full" alt={member.name} />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-muted-foreground">Trusted by developers worldwide</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
          {team.map((member) => (
            <div
              key={member.name}
              className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:bg-card justify-between"
            >
              <div className="aspect-square w-28 overflow-hidden rounded-full border-2 border-primary/20 p-1 transition-transform duration-300 group-hover:scale-105 group-hover:border-primary/50">
                <Image
                  src={member.imgPath}
                  width={112}
                  height={112}
                  className="object-cover h-full w-full rounded-full"
                  alt={member.name}
                />
              </div>

              <div className="flex flex-col items-center gap-1 text-center">
                <h3 className="text-lg font-bold text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-primary">
                  {member.role}
                </p>
              </div>

              <a
                href={`mailto:${member.email}`}
                className="flex items-center justify-center rounded-xl bg-primary/10 p-3 text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
