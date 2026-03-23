import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://127.0.0.1:3001/api/auth/login",
        formData
      );

      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage(res.data.message || "Login амжилттай");

      navigate("/");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login алдаа гарлаа");
    }
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-10 text-white">
      <div className="glass-panel w-full max-w-md p-8">
        <span className="glass-badge mb-4">AI Rubric System</span>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Login</h1>
        <p className="glass-muted mb-6 text-sm">
          Систем рүү нэвтрэх мэдээллээ оруулна уу
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-200">Email</label>
            <input
              type="email"
              name="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className="glass-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="glass-input"
            />
          </div>

          <button
            type="submit"
            className="glass-button w-full"
          >
            Login
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}

        <p className="glass-muted mt-6 text-sm">
          Бүртгэлгүй юу?{" "}
          <Link to="/register" className="glass-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
