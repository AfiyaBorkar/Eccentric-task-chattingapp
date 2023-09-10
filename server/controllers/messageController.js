const Messages = require("../models/messageModel");
const Group = require("../models/groupModel")
const User = require("../models/userModel");
const { messaging } = require('../config/firebaseConfig');
module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to, type } = req.body;
    console.log(type);

    if (type === "group") {
      const groupMessages = await Messages.find({
        users: { $elemMatch: { $eq: to } },
      }).sort({ updatedAt: 1 });

      const projectedGroupMessages = groupMessages.map(async (msg) => {
        // Query the sender information from the users collection
        const sender = await User.findOne({ _id: msg.sender });

        if (!sender) {
          // Handle the case where the sender doesn't exist
          return {
            fromSelf: false, // Or any other default value
            message: msg.message.text,
          };
        }

        return {
          fromSelf: sender._id.toString() === from,
          message: msg.message.text,
          sender: {
            _id: sender._id,
            username: sender.username, // Adjust this to match your user model
          },
        };
      });

      // Wait for all sender queries to complete
      const resolvedGroupMessages = await Promise.all(projectedGroupMessages);

      // Return group messages with sender information
      return res.json(resolvedGroupMessages);
    }

    // Query individual messages
    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map(async (msg) => {
      // Query the sender information from the users collection
      const sender = await User.findOne({ _id: msg.sender });

      if (!sender) {
        // Handle the case where the sender doesn't exist
        return {
          fromSelf: false, // Or any other default value
          message: msg.message.text,
        };
      }

      return {
        fromSelf: sender._id.toString() === from,
        message: msg.message.text,
      };
    });

    // Wait for all sender queries to complete
    const resolvedMessages = await Promise.all(projectedMessages);

    // Return individual messages with sender information
    return res.json(resolvedMessages);
  } catch (ex) {
    next(ex);
  }
};




// module.exports.addMessage = async (req, res, next) => {
//   try {
//     const { from, to, message,type,fcmtoken } = req.body;
//     console.log(fcmtoken)

//     const registrationToken = fcmtoken?fcmtoken:0;
//     console.log("🚀 ~ file: messageController.js:89 ~ module.exports.addMessage= ~ registrationToken:", fcmtoken)

//     const notimessage = {
//       notification: {
//         title: 'New Notification - from:'+type,
//         body: message,
//       },
//       token: registrationToken,
//     };
    
//     messaging
//       .send(notimessage)
//       .then((response) => {
//         console.log('Successfully sent message:', response);
//       })
//       .catch((error) => {
//         console.error('Error sending message:', error);
//       });
    
//     const data = await Messages.create({
//       message: { text: message },
//       users: [from, to],
//       sender: from,
//       type:type
//     });

//     if (data) return res.json({ msg: "Message added successfully." });
//     else return res.json({ msg: "Failed to add message to the database" });
//   } catch (ex) {
//     next(ex);
//   }
// };


module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message, type, fcmtoken } = req.body;
    console.log(fcmtoken);

    let registrationTokens = [];

    if (type === 'group') {
      // Fetch all registration tokens of users in the group
      const groupMembers = await User.find({fcmtoken: { $ne: "NA" }}); 
      registrationTokens = groupMembers.map((member) => member.fcmtoken);

      const notimessage = {
        notification: {
          title: type === undefined ? 'New Notification - from: User' : 'New Notification - from: ' + type,
          body: message,
        },
        tokens: registrationTokens, // Use 'tokens' instead of 'token' for multiple tokens
      };
  
      messaging
        .sendMulticast(notimessage)
        .then((response) => {
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
  

    } else {

      const notimessage2 = {
        notification: {
          title: type === undefined ? 'New Notification - from: User' : 'New Notification - from: ' + type,
          body: message+" ",
        },
        token: fcmtoken, 
      };
      console.log("🚀 ~ file: messageController.js:161 ~ module.exports.addMessage= ~ notimessage.fcmtoken:", fcmtoken)
  
      messaging
        .send(notimessage2)
        .then((response) => {
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
  
    }


    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
      type: type,
    });

    if (data) return res.json({ msg: 'Message added successfully.' });
    else return res.json({ msg: 'Failed to add message to the database' });
  } catch (ex) {
    next(ex);
  }
};