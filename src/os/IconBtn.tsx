interface Props { icon: string; label: string; selected: boolean; onSelect: () => void; onOpen: () => void }

/** Desktop and folder icon: double-click opens, a single tap opens on touch screens. */
export function IconBtn({ icon, label, selected, onSelect, onOpen }: Props) {
  return (
    <button className={'ic' + (selected ? ' sel' : '')}
      onClick={() => { onSelect(); if (matchMedia('(pointer:coarse)').matches) onOpen(); }}
      onDoubleClick={onOpen}>
      <b>{icon}</b><span>{label}</span>
    </button>
  );
}
