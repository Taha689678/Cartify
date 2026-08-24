import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [message, setMessage] = useState("Connecting...");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get("/health");
        setMessage(response.data.message);
      } catch (error) {
        console.error(error);
        setMessage("Backend connection failed");
      }
    };

    checkBackend();
  }, []);

  return (
    <div>
      <h1>Cartify</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;