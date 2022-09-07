const Post = require("../models/Post");
const User = require("../models/User");

exports.createPost = async (req, res) => {
  try {
    const post = await new Post(req.body).save();
    await post.populate("user", "first_name last_name cover picture username");
    res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const followingTmp = await User.findById(req.user.id).select("following");

    const following = followingTmp.following;

    const promises = following.map((user) => {
      return Post.find({ user: user })
        .populate("user", "picture first_name last_name username cover")
        .populate("comments.commentBy", "picture first_name last_name username")
        .sort({ createdAt: -1 })
        .limit(10);
    });

    const followingPosts = await (await Promise.all(promises)).flat();

    const userPost = await Post.find({ user: req.user.id })
      .populate("user", "picture first_name last_name username cover")
      .populate("comments.commentBy", "picture first_name last_name username")
      .sort({ createdAt: -1 })
      .limit(10);

    followingPosts.push(...[...userPost]);
    followingPosts.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    res.json(followingPosts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.comment = async (req, res) => {
  try {
    const { comment, image, postId } = req.body;
    let newComments = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            comment: comment,
            image: image,
            commentBy: req.user.id,
            commentAt: new Date(),
          },
        },
      },
      {
        new: true,
      }
    ).populate("comments.commentBy", "picture first_name last_name username");
    res.json(newComments.comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.user.id);

    const check = user?.savedPosts.find(
      (post) => post.post.toString() === postId
    );

    if (check) {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: {
          savedPosts: {
            _id: check._id,
          },
        },
      });
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          savedPosts: {
            post: postId,
            savedAt: new Date(),
          },
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await Post.findByIdAndRemove(req.params.id);
    res.json({
      status: "working",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
