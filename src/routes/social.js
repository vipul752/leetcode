const express = require("express");
const socialRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");

const {
  createPost,
  updatePost,
  deletePost,
  follow,
  unfollow,
  likePost,
  unlikePost,
  commentPost,
  editComment,
  deleteComment,
  getFeed,
  searchUser,
  getUserProfile,
  incrementView,
  numberOfLikes,
  getSinglePost,
  follower,
  following,
  removeFollower,
  getFollowers,
} = require("../controller/social.controller");

socialRouter.post("/create", userMiddleware, createPost);
socialRouter.put("/update/:postId", userMiddleware, updatePost);
socialRouter.delete("/delete/:postId", userMiddleware, deletePost);
socialRouter.post("/follow/:userId", userMiddleware, follow);
socialRouter.post("/unfollow/:userId", userMiddleware, unfollow);
socialRouter.post("/like/:postId", userMiddleware, likePost);
socialRouter.post("/unlike/:postId", userMiddleware, unlikePost);
socialRouter.post("/comment/:postId", userMiddleware, commentPost);
socialRouter.put(
  "/comment/update/:postId/:commentId",
  userMiddleware,
  editComment
);
socialRouter.delete(
  "/comment/delete/:postId/:commentId",
  userMiddleware,
  deleteComment
);
socialRouter.get("/feed", userMiddleware, getFeed);
socialRouter.get("/search/:query", userMiddleware, searchUser);
socialRouter.get("/profile/:firstName", userMiddleware, getUserProfile);
socialRouter.post("/incrementView/:postId", userMiddleware, incrementView);
socialRouter.get("/numberOfLikes/:postId", userMiddleware, numberOfLikes);
socialRouter.get("/post/:postId", userMiddleware, getSinglePost);
socialRouter.get("/followers/:userId", userMiddleware, follower);
socialRouter.get("/following/:userId", userMiddleware, following);
socialRouter.delete("/delete/:userId", userMiddleware, removeFollower);
socialRouter.get("/getFollowers", userMiddleware, getFollowers);

module.exports = socialRouter;
