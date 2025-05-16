const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { registerValidation, loginValidation } = require("../validation");

router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [req.body.email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).send("user exist");
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [req.body.name, req.body.email, hashPassword]
    );

    res.status(200).send({ user: newUser.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [req.body.email]);
    const user = result.rows[0];

    if (!user) return res.status(400).send({ msg: "user does not exist" });

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send("email or password wrong");

    const token = jwt.sign({ _id: user.id }, process.env.SECRET_KEY);
    res.header("auth-token", token).send({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
