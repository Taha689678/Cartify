import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    if (typeof connectDB !== "function") {
      throw new Error(
        "Database connection function is not available. Implement config/db.js before starting the server."
      );
    }

    await connectDB();

    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

    server.on("error", (error) => {
      console.error("Server startup failed.");
      console.error(error && error.message ? error.message : "Unknown server error");
      process.exit(1);
    });
  } catch (error) {
    const message =
      error && error.message ? error.message : "Unknown startup error";

    console.error("Failed to start server: database connection failed.");
    console.error(message);
    process.exit(1);
  }
};

startServer();
