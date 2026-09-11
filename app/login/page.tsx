"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, PackageSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./login.module.css";

const ADMIN_USERNAME = "adminintercel";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername !== ADMIN_USERNAME) {
      setError("Usuário ou senha inválidos.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${ADMIN_USERNAME}@intercel.local`,
      password
    });

    if (signInError) {
      setLoading(false);
      setError("Usuário ou senha inválidos.");
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.mark}><PackageSearch size={24} /></div>
          <div>
            <strong>INTERCEL</strong>
            <span>Gestão integrada</span>
          </div>
        </div>

        <h1 className={styles.title}>Acesso ao sistema</h1>
        <p className={styles.subtitle}>Entre com seu usuário e senha para continuar.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <div className={styles.passwordField}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </div>
  );
}
