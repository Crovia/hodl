import AirdropPool from '@/components/AirdropPool';
import { mockPool, mockSnapshots } from '@/lib/mockData';

export default function AirdropsPage() {
  return <AirdropPool pool={mockPool} snapshots={mockSnapshots} />;
}
