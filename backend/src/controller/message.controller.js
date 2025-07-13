import User from "../models/user.model.js"; // Import the User model
import Message from "../models/message.model.js"; // Import the Message model
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => { 
try {
    const loggedInUserId = req.user._id; // Get the logged-in user's ID from the request
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password"); // Exclude the logged-in user
    res.status(200).json(filteredUsers); // Send the filtered users as a response
} catch (error) {
    console.log("Error in getUsersForSidebar controller", error.message);
    res.status(500).json({ error: "Internal server error"});
    
}

}

export const getMessages = async (req, res) => {
    try {
        const {id:userToChatId} =req.params
        const myId = req.user._id; // Get the my ID from the request
        const messages = await Message.find({
            $or: [
                { senderId:myId, receiverId: userToChatId }, // Messages sent by the user to the chat partner
                { senderId: userToChatId, receiverId: myId } // Messages sent by the chat partner to the user
            ],
        });
        res.status(200).json(messages); // Send the messages as a response
    } catch (error) {
        console.log("Error in getMessages controller", error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body; // Get the message text and image from the request body
        const { id: receiverId } = req.params; // Get the receiver's ID from the request body
        const senderId = req.user._id; // Get the sender's ID from the request body
    
      let imageUrl;
      if(image) {
        //Upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url; // Get the secure URL of the uploaded image
    }

   const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image: imageUrl // Set the image URL if it exists
   });

   await newMessage.save(); // Save the new message to the database
   
   // todo: realtime functionality goes here => socket.io
   
  const receiverSocketId = getReceiverSocketId(receiverId);
  //If the user is online, send the event in realtime
  if(receiverSocketId) {
  io.to(receiverSocketId).emit("newMessage", newMessage);
  }


   res.status(201).json(newMessage); // Send the new message as a response

    } catch (error) {
        console.log("Error in sendMessage controller", error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }
}