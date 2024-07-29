const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.signUp = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({ email: email, name: name, password: hashedPw });
    const result = await user.save();
    res
      .status(201)
      .json({ message: "User created successfully", userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }
    loadedUser = user;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Incorrect password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      { userId: loadedUser._id.toString(), email: loadedUser.email },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      token,
      userId: loadedUser._id.toString(),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      status: user.status,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  const newStatus = req.body.status;

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { status: newStatus },
      { new: true }
    );
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Status updated successfully",
      status: user.status,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
