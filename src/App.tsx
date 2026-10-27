import { useOS } from './os/store';
import { Desktop } from './os/Desktop';
import { Taskbar } from './os/Taskbar';
import { Boot } from './os/Boot';

export default function App() {
  const booted = useOS((s) => s.booted);
  return (
    <>
      <Desktop />
      <Taskbar />
      {!booted && <Boot />}
    </>
  );
}
