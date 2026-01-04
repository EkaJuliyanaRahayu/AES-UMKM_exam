import { loginAdmin } from "../services/authService.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const token = await loginAdmin(username, password);
    res.json({
      message: "Login berhasil",
      token,
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
