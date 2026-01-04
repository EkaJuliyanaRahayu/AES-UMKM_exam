import { useState } from "react";
import api from "../api/axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  try {
    console.log("KIRIM LOGIN:", { username, password });

    const res = await api.post("/auth/login", {
      username,
      password,
    });

    console.log("RESPON LOGIN:", res.data);

    localStorage.setItem("token", res.data.token);

    alert("Login berhasil");
    window.location.href = "/products";
  } catch (err: any) {
    console.error("ERROR LOGIN:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Login gagal");
  }
};


  return (
    <div>
      <h2>Login Admin</h2>
      <input
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
