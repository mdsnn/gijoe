import { usePrefs } from '../os/store';
import { W } from '../os/wallpapers';

export function Display() {
  const rotate = usePrefs((s) => s.rotate);
  const setWp = usePrefs((s) => s.setWp);
  const setRotate = usePrefs((s) => s.setRotate);
  return (
    <div style={{ padding: 10 }}>
      <div>Choose a wallpaper:</div>
      <div className="thumbs">
        {W.map((bg, i) => (
          <button key={i} className="th sunk" style={{ background: bg }} aria-label={'Wallpaper ' + (i + 1)} onClick={() => setWp(i)} />
        ))}
      </div>
      <label>
        <input type="checkbox" checked={rotate} onChange={(e) => setRotate(e.target.checked)} /> Rotate wallpapers automatically
      </label>
      <p>Picking a wallpaper keeps it. Your choice is saved in this browser.</p>
    </div>
  );
}
