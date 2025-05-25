import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db, { initDB } from "./db";

export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: "Admin" | "Staff";
  name: string;
  email: string;
}

export async function registerUser(user: {
  name: string;
  email: string;
  username: string;
  password: string;
  role: "Admin" | "Staff";
}) {
  await initDB(); // Ensure DB is initialized
  const passwordHash = bcrypt.hashSync(user.password, 10);
  const id = uuidv4();
  try {
    await db.query(
      "INSERT INTO users (id, username, password_hash, role, name, email) VALUES ($1, $2, $3, $4, $5, $6);",
      [id, user.username, passwordHash, user.role, user.name, user.email]
    );
    await db.query(
      "INSERT INTO audit_log (id, action, user_id) VALUES ($1, $2, $3);",
      [uuidv4(), "register_user", id]
    );
    const userData = { id, username: user.username, role: user.role };
    localStorage.setItem("user", JSON.stringify(userData));
    document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=86400`;
    const channel = new BroadcastChannel("carequery");
    channel.postMessage("user-update");
    return userData;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error("Username already exists");
  }
}

export async function loginUser(
  username: string,
  password: string
): Promise<User> {
  await initDB(); // Ensure DB is initialized
  const result = await db.query("SELECT * FROM users WHERE username = $1;", [
    username,
  ]);
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }
  const user = result.rows[0] as User;
  if (!bcrypt.compareSync(password, user.password_hash)) {
    throw new Error("Invalid password");
  }
  // Log login action in audit_log
  await db.query(
    "INSERT INTO audit_log (id, action, user_id) VALUES ($1, $2, $3);",
    [uuidv4(), "login", user.id]
  );
  const userData = { id: user.id, username: user.username, role: user.role };
  localStorage.setItem("user", JSON.stringify(userData));
  document.cookie = `user=${JSON.stringify(userData)}; path=/; max-age=86400`;
  const channel = new BroadcastChannel("carequery");
  channel.postMessage("user-update");
  return user;
}

export function logoutUser() {
  localStorage.removeItem("user");
  document.cookie = "user=; path=/; max-age=0";
  const channel = new BroadcastChannel("carequery");
  channel.postMessage("user-update");
}
