import { DotWave } from "ldrs/react";
import "ldrs/react/DotWave.css";

interface LoaderProps {
  color?: string;
}

const Loader = ({ color }: LoaderProps) => {
  return <DotWave size="47" speed="1" color={color ?? "currentColor"} />;
};

export default Loader;
