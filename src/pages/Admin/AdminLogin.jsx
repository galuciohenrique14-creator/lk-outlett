import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_USER = 'rick';
const ADMIN_PASS = 'rick071007';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  return (
    <div className="container" style={{ padding: '22px 0' }}>
      <div className="loginWrap">
        <h1 className="loginTitle">Admin</h1>
        <p className="loginSub">Acesso ao painel administrativo.</p>

        <div className="loginCard">
          <label>
            Usuário
            <input value={user} onChange={(e) => setUser(e.target.value)} />
          </label>
          <label>
            Senha
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
          </label>

          <button
            className="loginBtn"
            onClick={() => {
              const ok = user === ADMIN_USER && pass === ADMIN_PASS;

              if (!ok) {
                alert('Credenciais inválidas.');
                return;
              }

              sessionStorage.setItem('lkoutlet_admin_ok', '1');
              navigate('/admin');
            }}
          >
            Entrar
          </button>
        </div>
      </div>

      <style>{`
        .loginWrap{border:1px solid rgba(255,255,255,.06);border-radius:22px;background:rgba(0,0,0,.12);padding:18px}
        .loginTitle{font-family:'Plus Jakarta Sans';font-weight:1000;font-size:40px;margin:0}
        .loginSub{color:rgba(233,234,242,.72);margin:10px 0 16px;font-weight:700}
        .loginCard{display:flex;flex-direction:column;gap:12px;max-width:420px}
        label{display:flex;flex-direction:column;gap:8px;color:rgba(233,234,242,.7);font-weight:800;font-size:12px}
        input{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:var(--text);padding:11px 12px;border-radius:14px;outline:none}
        .loginBtn{margin-top:6px;background:rgba(255,215,0,.18);border:1px solid rgba(255,215,0,.45);color:var(--gold);padding:14px;border-radius:18px;font-weight:1000;cursor:pointer}
      `}</style>
    </div>
  );
}

