"use client";

import { FormEvent, useState } from "react";
import { PackageSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./login.module.css";

const ADMIN_USERNAME = "adminintercel";
const ADMIN_EMAIL = "adminintercel@intercel.local";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState(ADMIN_USERNAME);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (username.trim().toLowerCase() !== ADMIN_USERNAME) {
      setError("Usuário ou senha inválidos.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
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
        <p className={styles.subtitle}>Entre com o usuário administrativo para continuar.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoFocus
            />
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
