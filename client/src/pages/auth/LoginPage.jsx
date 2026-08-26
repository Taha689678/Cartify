import { useForm } from "../../hooks/useForm";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";

export const LoginPage = () => {
  const { login } = useAuth();
  const { values, errors, handleChange, validateForm } = useForm(
    { email: "", password: "" },
    (values) => {
      const errors = {};
      if (!values.email) errors.email = "Email is required";
      if (!values.password) errors.password = "Password is required";
      return errors;
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await login(values);
      } catch (error) {
        console.error("Login failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};
