import { features, team } from "@/lib/constants";
import Image from "next/image";

const AboutUs = () => {
  return (
    <main
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
          {features.map((feature,idx:number)=>(
            <div key={idx} className="rounded-xl border border-green-pea-700 bg-green-pea-1800/40 p-5 text-left">
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
      </main>
  );
};

export default AboutUs;
