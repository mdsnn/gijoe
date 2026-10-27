import type { WinState } from '../os/store';

/** One viewer, three looks: plain page, PDF-style reader, browser-style project page. */
export function Doc({ win }: { win: WinState }) {
  const variant = (win.props?.variant as string | undefined) ?? 'doc';
  const body = (win.props?.body as string | undefined) ?? '';
  const paras = body.split('\n\n').map((p, i) => <p key={i}>{p}</p>);
  if (variant === 'pdf') {
    return (
      <>
        <div className="tool"><span>Page 1 / 1</span><span>Zoom 100%</span></div>
        <div className="gray"><div className="paper page"><h2>{win.title}</h2>{paras}</div></div>
      </>
    );
  }
  if (variant === 'project') {
    const slug = win.title.toLowerCase().replace(/\s+/g, '-');
    return (
      <>
        <div className="addr"><span>Address</span><div className="sunk">projects/{slug}</div></div>
        <div className="page"><h2>{win.title}</h2>{paras}</div>
      </>
    );
  }
  return <div className="page"><h2>{win.title}</h2>{paras}</div>;
}
