import React from 'react';

export default function Tracking() {
  return (
    <div className="container" style={{ padding: '22px 0' }}>
      <div className="tWrap">
        <h1 className="tTitle">Rastreio</h1>
        <p className="tSub">Informe o código de rastreio para consultar o status.</p>

        <div className="tCard">
          <label>Código de rastreio</label>
          <input className="tInput" placeholder="Ex: LK-123456" />
          <button className="tBtn" onClick={() => alert('Demonstração: conecte seu backend/integração para rastrear.')}>Consultar</button>
        </div>
      </div>

      <style>{`
        .tWrap{border:1px solid rgba(255,255,255,.06);border-radius:22px;background:rgba(0,0,0,.12);padding:18px}
        .tTitle{font-family:'Plus Jakarta Sans';font-weight:1000;font-size:34px;margin:0}
        .tSub{color:rgba(233,234,242,.72);margin:10px 0 18px}
        .tCard{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:14px}
        .tCard label{display:block;color:rgba(233,234,242,.7);font-weight:800;font-size:12px;margin-bottom:8px}
        .tInput{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:var(--text);padding:11px 12px;border-radius:14px;outline:none;margin-bottom:12px}
        .tBtn{width:100%;background:rgba(255,215,0,.16);border:1px solid rgba(255,215,0,.42);color:var(--gold);padding:12px;border-radius:16px;font-weight:1000;cursor:pointer}
      `}</style>
    </div>
  );
}

