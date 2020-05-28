const Post = require('../../models/post');
const User = require('../../models/user');

module.exports = {
    create : async (userId,postItem, res) => {
        let id = userId;
        const { title, subtitle} = postItem;
        const post = await Post.create({
            title,
            subtitle,
            user:id
        });
        await post.save();
        const userById = await User.findById(id);
        userById.posts.push(post);
        await userById.save();
        return userById;
    },
    userByPost : async (req,res)=>{
        const { id } = req.params;
        const userByPost = await Post.findById(id).populate('user');
        res.send(userByPost);
    }
}
