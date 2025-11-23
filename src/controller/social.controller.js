const Post = require("../model/post");
const User = require("../model/user");

const createPost = async (req, res) => {
  try {
    const user = req.result._id;
    const text = req.body.text;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Post text cannot be empty" });
    }

    const post = await Post.create({
      owner: user,
      text,
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
    const { text } = req.body;
    const userId = req.result._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.text = text || post.text;
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

    res.json({ message: "Comment added", comments: post.comments });
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

    await post.save();

    res.json({
      message: "Comment updated",
      comments: post.comments,
    });
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

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getFeed = async (req, res) => {
  try {
    const me = await User.findById(req.result._id).select("following");

    const feed = await Post.find({
      owner: { $in: me.following },
    })
      .sort({ createdAt: -1 })
      .populate("owner", "firstName lastName avatar")
      .populate("comments.user", "firstName lastName avatar");

    res.json(feed);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const searchUser = async (req, res) => {
  try {
    const { query } = req.params;

    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    }).select("firstName lastName username avatar");

    res.json(users);
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

module.exports = {
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
};
