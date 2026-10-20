import { Composition } from "remotion";
import { RssiVideo } from "./RssiVideo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="RssiVideo"
      component={RssiVideo}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1350}
    />
  );
};
