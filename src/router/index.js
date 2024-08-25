import express from "express";
const User = require("../model/User");
import createResponse from "../helpers/responseHelper";
import { verifyToken } from "../middleware/authentication";

import { loginUser, registerUser, changePasswordUser } from "../controller/authController";

import { createUser, updateUser, deleteUser, getOneUser, getAllUsers } from "../controller/managerController";

import { getInfor } from "../controller/userController";

let initRoutes = () => {
  let router = express.Router();

  //auth
  router.post("/auth/login", loginUser);
  router.post("/auth/register", registerUser);
  router.post("/auth/change-password", changePasswordUser);

  //user
  router.get("/user/:userName", getInfor);

  //manager
  router.post("/manager/mongo/user", async (req, res) => {
    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }
      user = new User({
        name,
        email,
        password,
      });

      await user.save();

      res.status(201).json({ msg: "User created successfully" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });

  router.get("/manager/mongo/users", async (req, res) => {
    try {
      let users = await User.find({});

      res.status(200).json({ msg: "User created successfully", data: users });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });

  router.post("/manager/users", createUser);
  router.put("/manager/users/:userId", updateUser);
  router.delete("/manager/users/:userId", deleteUser);
  router.get("/manager/users/:userId", getOneUser);
  router.get("/manager/users", verifyToken("manager_role"), getAllUsers); // verifyToken("manager_role")

  router.all("/*", (req, res) => {
    return res.status(404).json(createResponse(-1, "Không tìm thấy url", null));
  });

  return router;
};

module.exports = initRoutes;
