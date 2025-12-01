const Post = require("../model/post");
const User = require("../model/user");
const mongoose = require("mongoose");

const createPost = async (req, res) => {
  try {
    const user = req.result._id;
    const { title, description, anonymous } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Post title cannot be empty" });
    }

    const post = await Post.create({
      owner: user,
      title,
      description,
      anonymous,
    });

    await User.findByIdAndUpdate(user, {
      $addToSet: { posts: post._id },
    });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const { title, description, anonymous } = req.body;
    const userId = req.result._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.title = title || post.title;
    post.description = description || post.description;
    post.anonymous =
      req.body.anonymous !== undefined ? req.body.anonymous : post.anonymous;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await Post.findByIdAndDelete(postId);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const follow = async (req, res) => {
  try {
    const userId = req.result._id;
    const targetUserId = req.params.userId;

    if (userId === targetUserId)
      return res.status(400).json({ msg: "Can't follow yourself" });

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser)
      return res.status(404).json({ msg: "User to follow not found" });
    if (user.following.includes(targetUserId))
      return res.status(400).json({ msg: "Already following this user" });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { following: targetUserId },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: userId },
    });

    res.json({ msg: "Followed" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const unfollow = async (req, res) => {
  try {
    const userId = req.result._id;
    const targetUserId = req.params.userId;

    if (userId === targetUserId)
      return res.status(400).json({ msg: "Can't unfollow yourself" });

    const user = await User.findById(userId);

    const targetUser = await User.findById(targetUserId);

    if (!targetUser)
      return res.status(404).json({ msg: "User to unfollow not found" });

    if (!user.following.includes(targetUserId))
      return res.status(400).json({ msg: "Not following this user" });

    await User.findByIdAndUpdate(userId, {
      $pull: { following: targetUserId },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: userId },
    });

    res.json({ msg: "Unfollowed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const likePost = async (req, res) => {
  try {
    const userId = req.result._id;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: "Post already liked" });
    }
    await Post.findByIdAndUpdate(postId, {
      $addToSet: { likes: userId },
    });

    res.json({ message: "Post liked" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const unlikePost = async (req, res) => {
  try {
    const userId = req.result._id;
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.likes.includes(userId)) {
      return res.status(400).json({ message: "Post not liked yet" });
    }
    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: userId },
    });

    res.json({ message: "Post unliked" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const commentPost = async (req, res) => {
  try {
    const userId = req.result._id;
    const postId = req.params.postId;

    const { comment, text } = req.body;

    const finalComment = comment || text;

    if (!finalComment) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({ user: userId, text: finalComment });
    await post.save();

    const updatedPost = await Post.findById(postId).populate(
      "comments.user",
      "firstName lastName avatar _id"
    );
    const newComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.json(newComment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const editComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;

    const { comment, text } = req.body;

    const finalComment = comment || text;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentObj = post.comments.id(commentId);

    if (!commentObj) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (finalComment) {
      commentObj.text = finalComment;
    }

    await post.populate("comments.user", "firstName lastName avatar");
    res.json(commentObj);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentId = req.params.commentId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentObj = post.comments.id(commentId);
    if (!commentObj) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = post.comments.id(commentId);

    commentObj.deleteOne();
    await post.save();
    res.json({ message: "Comment deleted", commentId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getFeed = async (req, res) => {
  try {
    const allPosts = await Post.find()
      .populate("owner", "firstName lastName avatar")
      .populate("comments.user", "firstName lastName avatar");

    res.json(allPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const searchUser = async (req, res) => {
  try {
    const { query } = req.params;
    const loggedInUserId = req.result._id;

    const users = await User.find({
      _id: { $ne: loggedInUserId },
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    }).select("firstName lastName username avatar followers following posts");

    const finalUsers = users.map((u) => ({
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      avatar: u.avatar,

      followers: u.followers,
      following: u.following,
      posts: u.posts,

      isFollowing: u.followers.includes(loggedInUserId),
    }));

    res.json(finalUsers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const firstName = req.params.firstName.toLowerCase();

    const user = await User.findOne({
      firstName: { $regex: `^${firstName}$`, $options: "i" },
    })
      .select("-password")
      .populate("followers", "firstName avatar")
      .populate("following", "firstName avatar");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const postsCount = await Post.countDocuments({ owner: user._id });

    res.json({
      user,
      stats: {
        posts: postsCount,
        followers: user.followers.length,
        following: user.following.length,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const incrementView = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    post.views += 1;
    await post.save();

    res.json({ views: post.views });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const numberOfLikes = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json({ likes: post.likes.length });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getSinglePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId)
      .populate("owner", "firstName lastName avatar")
      .populate("comments.user", "firstName lastName avatar");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const follower = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "followers",
      "firstName lastName username avatar"
    );

    res.json(user.followers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const following = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      "following",
      "firstName lastName username avatar"
    );

    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

const removeFollower = async (req, res) => {
  try {
    const userId = req.result._id;
    const followerId = req.params.id;

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: followerId },
    });

    await User.findByIdAndUpdate(followerId, {
      $pull: { following: userId },
    });

    res.json({ message: "Follower removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const getFollowers = async (req, res) => {
  const userId = req.result._id;

  const me = await User.findById(userId).populate(
    "followers",
    "firstName lastName username avatar followers following"
  );

  const result = me.followers.map((user) => ({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    avatar: user.avatar,

    isFollowing: user.followers.includes(userId),
    iFollowHim: user.following.includes(userId),

    followBack: !user.following.includes(userId),
  }));

  res.json(result);
};

const getUserPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    let user = null;

    if (mongoose.Types.ObjectId.isValid(username)) {
      user = await User.findById(username)
        .select("-password")
        .populate("followers", "firstName lastName avatar")
        .populate("following", "firstName lastName avatar");
    }

    if (!user) {
      user = await User.findOne({ username })
        .select("-password")
        .populate("followers", "firstName lastName avatar")
        .populate("following", "firstName lastName avatar");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getUserPost = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ owner: userId })
      .populate("owner", "firstName lastName avatar")
      .populate("comments.user", "firstName lastName avatar");

    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const checkFollow = async (req, res) => {
  try {
    const userId = req.result._id;
    const targetUserId = req.params.userId;

    const user = await User.findById(userId);

    const isFollowing = user.following.includes(targetUserId);
    res.json({ isFollowing });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const isBothUserFollowEachOther = async (req, res) => {
  try {
    const user1 = req.result._id; 
    const user2 = req.params.userId; 

   
    const user1Follows = await User.exists({
      _id: user1,
      following: user2,
    });

    const user2Follows = await User.exists({
      _id: user2,
      following: user1,
    });

    const bothFollow = Boolean(user1Follows && user2Follows);

    return res.status(200).json({ bothFollow });
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  follow,
  unfollow,
  likePost,
  unlikePost,
  commentPost,
  getUserPost,
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
  getUserPublicProfile,
  checkFollow,
  isBothUserFollowEachOther,
};
