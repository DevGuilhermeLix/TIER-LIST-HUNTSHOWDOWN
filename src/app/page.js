import TierBoard from '@/components/TierBoard';
import data from '@/data/weapons.json';

export default function Home() {
  return <TierBoard data={data} />;
}
