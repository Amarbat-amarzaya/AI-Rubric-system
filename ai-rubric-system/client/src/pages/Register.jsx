import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://127.0.0.1:3001/api/auth/register",
        form
      );

      setMessage(res.data.message);
      navigate("/login");
    } catch (error) {
      setMessage(error.response?.data?.message || "Алдаа гарлаа");
    }
  };

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-6 py-10 text-white">
      <form
        onSubmit={handleSubmit}
        className="glass-panel w-full max-w-md space-y-4 p-6"
      >
        <span className="glass-badge">Create account</span>
        <h1 className="text-2xl font-bold tracking-tight">Register</h1>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="glass-input"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="glass-input"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="glass-input"
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="glass-input"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="glass-button w-full"
        >
          Register
        </button>

        {message && <p className="text-sm text-emerald-300">{message}</p>}

        <p className="glass-muted text-sm">
          Already have an account?{" "}
          <Link to="/login" className="glass-link">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
