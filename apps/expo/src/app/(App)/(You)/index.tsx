import AnimatedPageFrame from "../../../../components/frame/AnimatedPageFrame";

export default function YouPage() {
  const baseColor = "0,136,255";
  const header = "Welcome,\nChipmunk Bar"; // Should be username
  return (
    <>
      <AnimatedPageFrame
        baseColor={baseColor}
        scrollEnabled={false}
        headerTitle={header}
      >
        <></>
      </AnimatedPageFrame>
    </>
  );
}
