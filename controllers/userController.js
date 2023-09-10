const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Group = require("../models/groupModel")

module.exports.login = async (req, res, next) => {
  try {
    const { username, password, fcmtoken } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.json({ msg: 'Incorrect Username or Password', status: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ msg: 'Incorrect Username or Password', status: false });
    }

    // Update the FCM token for the user only if login is successful
    await User.updateOne({ _id: user._id }, { $set: { fcmtoken } }); // Assuming the field in the Mongoose User model is 'fcmtoken'

    // Remove the password from the response for security
    user.password = undefined;

    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};
    // Create or find the "All Users" group and add the user to it
    // let allUsersGroup = await Group.findOne({ name: "All Users" });
    // if (!allUsersGroup) {
    //   allUsersGroup = await Group.create({ name: "All Users" });
    // }
    // allUsersGroup.members.push(user._id);
    // await allUsersGroup.save();

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password,fcmtoken } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      fcmtoken
    });

    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};


module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "fcmtoken",
      "_id",
    ]);

    // Fetch the "All Users" group
    const allUsersGroup = await Group.findOne();

    if (!allUsersGroup) {
      // Handle the case where the group does not exist
      return res.json({ users });
    }

    let groupInfo = {
      _id: allUsersGroup._id,
      username: allUsersGroup.name,
      type:"group"
    };

    users.push(groupInfo);

    return res.json(users); // Return the updated users array including groupInfo
  } catch (ex) {
    next(ex);
  }
};

// module.exports.getAllUsers = async (req, res, next) => {
//   try {
//     const users = await User.find({ _id: { $ne: req.params.id } }).select([
//       "email",
//       "username",
//       "avatarImage",
//       "_id",
//     ]);

//     // Fetch the "All Users" group
//     const allUsersGroup = await Group.findOne({ name: "All Users" });

//     if (!allUsersGroup) {
//       // Handle the case where the group does not exist
//       return res.json({ users });
//     }

//     // Include the "All Users" group information for each user
//     const usersWithGroupInfo = users.map((user) => ({
//       ...user.toObject(),
//       groupInfo: allUsersGroup, // Add the group information to each user
//     }));

//     return res.json(usersWithGroupInfo);
//   } catch (ex) {
//     next(ex);
//   }
// };


module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send("Logout Succcessfully");
  } catch (ex) {
    next(ex);
  }
};
