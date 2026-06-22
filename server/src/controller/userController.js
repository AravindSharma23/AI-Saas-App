import Creations from "../model/Creations.js";

export const getUserCreations = async (req,res) => {
    try {
        const {userId} =req.auth();

        const creations = await Creations.find({user_id:userId}).sort({createdAt:-1});

        res.json({success:true,creations});       
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export const getPublishedCreations = async (req,res) => {
    try {
        const creations = await Creations.find({publish:true}).sort({createdAt:-1});
        res.json({success:true,creations});
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export const toggleLikeCreation = async (req,res) => {
    try {
        const {userId} =req.auth();
        const {id} =req.body;        

        const creation = await Creations.findById(id);

        if(!creation){
            res.json({success:false,message:"Creation not found"})
        }
        const currentLikes = creation.likes

        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if(currentLikes.includes(userIdStr)){
            updatedLikes = currentLikes.filter((user)=>user!==userIdStr);
            message = 'Creation Unliked';
        } else {
            updatedLikes = [...currentLikes,userIdStr]
            message = 'Creation Liked';
        }

        await Creations.findByIdAndUpdate(id,{likes:updatedLikes});

        res.json({success:true,message});       
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

