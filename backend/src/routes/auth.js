import store from "../data/store.js";

export default async function (app) {
 
  app.post("/api/register", async (request, reply) => {
    try {
      const { email, password, confirmPassword, name, phone } = request.body || {};

      if (!email || !password || !confirmPassword || !name || !phone) {
        return reply.status(400).send({ message: "All fields are required" });
      }

      if (password !== confirmPassword) {
        return reply.status(400).send({ message: "Passwords do not match" });
      }

      if (password.length < 6) {
        return reply.status(400).send({ message: "Password must be at least 6 characters" });
      }

      if (!/^[0-9]{10}$/.test(phone.replace(/[\D]/g, ""))) {
        return reply.status(400).send({ message: "Please enter a valid 10-digit phone number" });
      }

      
      const existingUser = store.getUser(email);
      if (existingUser) {
        return reply.status(400).send({ message: "User already exists" });
      }

      
      const userData = {
        email,
        name,
        phone,
        password, 
        registeredAt: new Date().toISOString(),
      };

      store.saveUser(email, userData);
      await store.saveAll();

      return { 
        success: true, 
        message: "Registration successful",
        token: "mock-jwt-token", 
        user: { email, name, phone } 
      };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ message: "Registration failed", error: err.message });
    }
  });

 
  app.post("/api/login", async (request, reply) => {
    try {
      const { email, password } = request.body || {};

      if (!email || !password) {
        return reply.status(400).send({ message: "Email and password are required" });
      }

      
      const user = store.getUser(email);
      if (user && user.password === password) {
        return { 
          token: "mock-jwt-token", 
          user: { email, name: user.name, phone: user.phone } 
        };
      }

      
      if (email === "test@gmail.com" && password === "test@123") {
        return { 
          token: "mock-jwt-token", 
          user: { email, name: "Test User", phone: "1234567890" } 
        };
      }

      return reply.status(401).send({ message: "Invalid credentials" });
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ message: "Login failed", error: err.message });
    }
  });

  
  app.get("/api/user/:email", async (request, reply) => {
    try {
      const { email } = request.params;
      
    
      let user = store.getUser(email);
      if (user) {
        return { user: { email, name: user.name, phone: user.phone } };
      }

      
      if (email === "test@gmail.com") {
        return { user: { email, name: "Test User", phone: "1234567890" } };
      }

      return reply.status(404).send({ message: "User not found" });
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ message: "Failed to retrieve user" });
    }
  });
}