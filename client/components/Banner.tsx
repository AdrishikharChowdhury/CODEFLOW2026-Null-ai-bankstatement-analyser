import DotGrid from "./DotGrid";
const Banner = () => {
  return (
    <div className="w-full h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div id="home" className="w-full h-full z-0 relative">
        <DotGrid
          dotSize={5}
          gap={20}
          baseColor="#CBD5E1"
          activeColor="#3b82f6"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        >
          <div className="relative z-10 flex flex-col items-center gap-4 h-full justify-center">
            <div className="flex flex-col items-center justify-center gap-2">
                <h1 className="text-5xl font-bold text-foreground">Welcome to Financialo</h1>
            <p className="text-lg text-muted-foreground">Your Personal Bank Statement Analyser</p>
            </div>
          </div>
        </DotGrid>
      </div>
    </div>
  );
};

export default Banner;
