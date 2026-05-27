import { features } from "@/lib/constants";

const AboutUs = () => {
  return (
    <section
      className="w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 lg:py-24 gap-10 sm:gap-16 lg:gap-20 bg-primary/5"
      id="about-us"
    >
      <div className="flex flex-col items-center gap-4 sm:gap-6 text-center max-w-4xl">
        <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold tracking-wide text-primary uppercase bg-primary/10 rounded-full">
          Our Vision
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">About Financialo</h2>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed px-2 sm:px-0">
          Financialo is an AI-powered bank statement analyser built to help
          individuals and businesses make sense of their financial data. Upload
          your PDF statements and get instant insights — transaction patterns,
          spending breakdowns, monthly trends, and anomalies flagged — all in
          one clean dashboard.
        </p>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed px-2 sm:px-0">
          Powered by intelligent parsing and machine learning models, it
          automatically categorises every transaction, detects irregularities,
          and generates detailed reports so you never have to dig through rows
          of data again. Whether you are managing personal finances or
          reconciling business accounts, Financialo turns raw bank data into
          actionable clarity.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full mt-6 sm:mt-8">
          {features.map((feature, idx: number) => (
            <div key={idx} className="group rounded-2xl border border-border bg-card p-4 sm:p-6 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <span className="text-base sm:text-xl font-bold">{idx + 1}</span>
              </div>
              <h3 className="text-foreground font-bold mb-1 sm:mb-2 text-base sm:text-lg">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
