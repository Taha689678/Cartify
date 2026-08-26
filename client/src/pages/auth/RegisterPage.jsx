import { useForm } from "../../hooks/useForm";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";

export const RegisterPage = () => {
  const { register } = useAuth();
  const { values, errors, handleChange, validateForm } = useForm(
    { name: "", username: "", email: "", password: "", phone: "" },
    (values) => {
      const errors = {};
      if (!values.name) errors.name = "Name is required";
      if (!values.username) errors.username = "Username is required";
      if (!values.email) errors.email = "Email is required";
      if (!values.password) errors.password = "Password is required";
      return errors;
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await register(values);
      } catch (error) {
        console.error("Registration failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Input
            label="Username"
            type="text"
            name="username"
            value={values.username}
            onChange={handleChange}
            error={errors.username}
          />
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
          <Input
            label="Phone (optional)"
            type="tel"
            name="phone"
            value={values.phone}
            onChange={handleChange}
          />
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
      </div>
    </div>
  );
};
