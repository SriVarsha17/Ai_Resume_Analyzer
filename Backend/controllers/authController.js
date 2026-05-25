const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// GENERATE TOKEN
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};


// REGISTER USER
const registerUser = async (req, res, next) => {
  try {

    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });

  } catch (error) {
    next(error);
  }
};


// LOGIN USER
const loginUser = async (req, res, next) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });

    } else {

      res.status(401);
      throw new Error("Invalid email or password");

    }

  } catch (error) {
    next(error);
  }

};


// GET USER PROFILE
const getUserProfile = async (req, res, next) => {

  try {

    const user = await User
      .findById(req.user._id)
      .select("-password");

    res.json(user);

  } catch (error) {
    next(error);
  }

};


// UPDATE USER PROFILE
const updateUserProfile = async (req, res, next) => {

  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);

    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      token: generateToken(updatedUser._id)
    });

  } catch (error) {
    next(error);
  }

};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};