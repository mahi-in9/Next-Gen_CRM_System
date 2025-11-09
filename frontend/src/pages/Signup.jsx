import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../features/authSlice";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user, accessToken } = useSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "SALES", // ✅ match backend default role name
  });

  const [formError, setFormError] = useState("");

  /* ------------------ Redirect if logged in ------------------ */
  useEffect(() => {
    if (user && accessToken) navigate("/dashboard");
  }, [user, accessToken, navigate]);

  /* ------------------ Handle Input Change ------------------ */
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  /* ------------------ Handle Submit ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const { name, email, password, role } = form;
    if (!name || !email || !password || !role) {
      setFormError("All fields are required.");
      return;
    }

    try {
      await dispatch(registerUser(form)).unwrap();
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup failed:", err);
      setFormError(err || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-8"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Create Your Account
        </h2>

        <div className="mb-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border border-gray-300 p-3 rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border border-gray-300 p-3 rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border border-gray-300 p-3 rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
            required
          />
        </div>

        <div className="mb-6">
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
            required
          >
            <option value="SALES">Sales</option>
            <option value="MANAGER">Manager</option>
          </select>
        </div>

        {(formError || error) && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {formError || error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2 rounded-md transition ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 cursor-pointer font-medium hover:underline"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
