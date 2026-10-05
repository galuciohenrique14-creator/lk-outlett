import React from 'react';

export default function SkeletonGrid({ count = 8 }) {
  return (
    <div className="skGrid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skCard" key={i}>
          <div className="skMedia skeleton" />
          <div className="skBody">
            <div className="skLine skeleton" style={{ width: '78%' }} />
            <div className="skLine skeleton" style={{ width: '92%' }} />
            <div className="skPriceRow">
              <div className="skPrice skeleton" style={{ width: '50%' }} />
              <div className="skOld skeleton" style={{ width: '34%' }} />
            </div>
            <div className="skBtn skeleton" />
          </div>
        </div>
      ))}

      <style>{`
        .skGrid{display:grid;grid-template-columns:repeat(4, minmax(0,1fr));gap:14px}
        .skCard{background:rgba(255,255,255,.03);border:1px solid rgba(255,215,0,.12);border-radius:18px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.28)}
        .skMedia{aspect-ratio:4/3;}
        .skBody{padding:14px;display:flex;flex-direction:column;gap:10px}
        .skLine{height:12px;border-radius:999px}
        .skPriceRow{display:flex;gap:10px;align-items:center}
        .skPrice{height:18px;border-radius:999px}
        .skOld{height:12px;border-radius:999px}
        .skBtn{height:40px;border-radius:14px}
        @media(max-width:1100px){.skGrid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:820px){.skGrid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:520px){.skGrid{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}

