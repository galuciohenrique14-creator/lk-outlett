import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const ADMIN_USER = 'rick';
const ADMIN_PASS = 'rick071007';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (user.trim() !== ADMIN_USER || pass !== ADMIN_PASS) {
      setError('Usuário ou senha inválidos.');
      return;
    }

    sessionStorage.setItem('lkoutlet_admin_ok', '1');
    navigate('/admin');
  };

  return (
    <div className="container adminPage">
      <div className="loginWrap">
        <h1 className="loginTitle">Admin</h1>
        <p className="loginSub">Acesso ao painel administrativo.</p>

        <form className="loginCard" onSubmit={submit}>
          <label>
            Usuário
            <input autoComplete="username" required value={user} onChange={(event) => setUser(event.target.value)} />
          </label>
          <label>
            Senha
            <input type="password" autoComplete="current-password" required value={pass} onChange={(event) => setPass(event.target.value)} />
          </label>
          {error && <div className="loginError" role="alert">{error}</div>}
          <button className="loginBtn" type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}
