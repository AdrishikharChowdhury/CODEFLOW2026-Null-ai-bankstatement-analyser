import { features } from "@/lib/constants";

const AboutUs = () => {
  return (
    <section
      className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-24 gap-20 bg-primary/5"
      id="about-us"
    >
      <div className="flex flex-col items-center gap-6 text-center max-w-4xl">
        <div className="inline-block px-4 py-1.5 mb-2 text-sm font-semibold tracking-wide text-primary uppercase bg-primary/10 rounded-full">
          Our Vision
        </div>
        <h2 className="text-5xl font-bold tracking-tight text-foreground">About Financialo</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Financialo is an AI-powered bank statement analyser built to help
          individuals and businesses make sense of their financial data. Upload
          your PDF statements and get instant insights — transaction patterns,
          spending breakdowns, monthly trends, and anomalies flagged — all in
          one clean dashboard.
        </p>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Powered by intelligent parsing and machine learning models, it
          automatically categorises every transaction, detects irregularities,
          and generates detailed reports so you never have to dig through rows
          of data again. Whether you are managing personal finances or
          reconciling business accounts, Financialo turns raw bank data into
          actionable clarity.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-8">
          {features.map((feature, idx: number) => (
            <div key={idx} className="group rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
              <div className="w-12 h-12 mb-4 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <span className="text-xl font-bold">{idx + 1}</span>
              </div>
              <h3 className="text-foreground font-bold mb-2 text-lg">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
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
