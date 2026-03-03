import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';
import Demo from '@/components/demo';

export default function HomePage() {
  return (
    <>
      <Demo />
      <Welcome />
      <ColorSchemeToggle />
    </>
  );
}
