import MultiBanner from './MultiBanner';
import MissionBanner from './MissionBanner';
import Solutions from './Solutions';

const AboutUsSection = () => {
  return (
    <div className="mt-10">
      <MultiBanner />

      {/* Mission */}
      <MissionBanner />

      {/* solutions */}
      <Solutions />
    </div>
  );
};

export default AboutUsSection;
