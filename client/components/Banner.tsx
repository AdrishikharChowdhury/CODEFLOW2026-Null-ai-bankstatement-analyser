import DotGrid from "./DotGrid";
const Banner = () => {
  return (
    <div className="w-full h-screen">
      <div id="home" className="w-full h-full z-0 relative">
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#1A1A1A"
          activeColor="#F0EC07"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        >
          <div className="relative z-10 flex flex-col items-center gap-4 h-full justify-center">
            <div className="flex flex-col items-center justify-center gap-2">
                <h1 className="text-4xl font-bold">Welcome to Financialo</h1>
            <p className="text-lg">Your Personal Bank Statement Analyser</p>
            </div>
          </div>
        </DotGrid>
      </div>
    </div>
  );
};

export default Banner;
