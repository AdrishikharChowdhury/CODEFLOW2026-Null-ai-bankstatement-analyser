import { features, team } from "@/lib/constants";
import Image from "next/image";

const AboutUs = () => {
  return (
    <section
      className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-20 gap-20"
      id="about-us"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-5xl font-bold tracking-tight">About Financialo</h2>
        <p className="text-green-pea-200 text-lg leading-relaxed">
          Financialo is an AI-powered bank statement analyser built to help
          individuals and businesses make sense of their financial data. Upload
          your PDF statements and get instant insights — transaction patterns,
          spending breakdowns, monthly trends, and anomalies flagged — all in
          one clean dashboard.
        </p>
        <p className="text-green-pea-200 text-lg leading-relaxed">
          Powered by intelligent parsing and machine learning models, it
          automatically categorises every transaction, detects irregularities,
          and generates detailed reports so you never have to dig through rows
          of data again. Whether you are managing personal finances or
          reconciling business accounts, Financialo turns raw bank data into
          actionable clarity.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4">
          {features.map((feature)=>(
            <div className="rounded-xl border border-green-pea-700 bg-green-pea-1800/40 p-5 text-left">
            <h3 className="text-green-pea-400 font-semibold mb-1">
              {feature.title}
            </h3>
            <p className="text-green-pea-200 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
          ))}
          
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <h2 className="text-3xl font-bold tracking-tight">
          Team <span className="text-green-pea-400">Null</span>
        </h2>
        <p className="text-green-pea-200 text-lg max-w-xl text-center">
          Four minds, one mission — building smarter financial tools.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {team.map((member) => (
          <div
            key={member.name}
            className="group relative flex flex-col items-center gap-5 rounded-2xl border border-green-pea-700 bg-green-pea-1800/60 p-8 transition-all duration-300 hover:border-green-pea-400 hover:shadow-[0_0_30px_-8px] hover:shadow-green-pea-400/30"
          >
            {member.imgPath === "" ? (
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br ${member.color} text-xl font-bold text-green-pea-1900 shadow-lg`}
              >
                {member.initials}
              </div>
            ) : (
              <div className="aspect-square w-40 overflow-hidden rounded-full">
                <Image
                  src={member.imgPath}
                  width={180}
                  height={90}
                  className="object-cover h-full w-full"
                  alt="logo"
                />
              </div>
            )}

            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-lg font-semibold text-green-pea-50">
                {member.name}
              </h3>
              <p className="text-sm font-medium text-green-pea-400">
                {member.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutUs;
