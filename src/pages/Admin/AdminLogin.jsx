import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, signInAdmin } from '../../data/supabase.js';
import './admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="container adminPage">
      <div className="loginWrap">
        <h1 className="loginTitle">Admin</h1>
        <p className="loginSub">
          {isSupabaseConfigured
            ? 'Entre com a conta de administrador cadastrada no Supabase.'
            : 'Configure o catálogo compartilhado do Supabase para ativar o acesso administrativo seguro.'}
        </p>

        <form className="loginCard" onSubmit={async (event) => {
          event.preventDefault();
          setError('');
          setSubmitting(true);
          try {
            await signInAdmin(user.trim(), pass);
            window.dispatchEvent(new Event('lk:products-refresh'));
            navigate('/admin');
          } catch (loginError) {
            setError(loginError.message);
          } finally {
            setSubmitting(false);
          }
        }}>
          <label>
            E-mail
            <input
              type="email"
              autoComplete="username"
              required
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </label>
          <label>
            Senha
            <input type="password" autoComplete="current-password" required value={pass} onChange={(e) => setPass(e.target.value)} />
          </label>
          {error && <div className="loginError" role="alert">{error}</div>}
          <button className="loginBtn" type="submit" disabled={submitting || !isSupabaseConfigured}>
            {!isSupabaseConfigured ? 'Configure o Supabase' : submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
