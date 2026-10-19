import { Composition } from "remotion";
import { FullReplica, MechanismShowcase, RefinementPreview } from "./Film";
import { ScreenshotStage } from "./ScreenshotStage";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RefinementPreview"
        component={RefinementPreview}
        width={816}
        height={1080}
        fps={30}
        durationInFrames={659}
        defaultProps={{ useReferenceAudio: false }}
      />
      <Composition
        id="FullReplica"
        component={FullReplica}
        width={816}
        height={1080}
        fps={30}
        durationInFrames={4215}
        defaultProps={{ useReferenceAudio: false, useReferenceInsert: false }}
      />
      <Composition
        id="MechanismShowcase"
        component={MechanismShowcase}
        width={816}
        height={1080}
        fps={30}
        durationInFrames={1475}
      />
      <Composition
        id="ScreenshotStage"
        component={ScreenshotStage}
        width={816}
        height={1080}
        fps={30}
        durationInFrames={360}
      />
    </>
  );
};
