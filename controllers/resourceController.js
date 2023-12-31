import resourceModel from "../models/resourceModel.js"
import upload from "../middleware/cloudinary.js"

export const  createResource=async(req,res,next)=>{
    try {
        console.log(req.body)
        if (!req.files) return res.send('Please upload a document!');


        const {resource}= req.files



        const cloudFile = await upload(resource.tempFilePath);

        const newResource= await resourceModel({
            userId:req.user.id,
            resourceUrl:cloudFile.secure_url,
            resourceName:req.body.resourceName,
            category:req.body.category,
            privacy:req.body.privacy
        })

        await newResource.save()
        res.status(200).json(newResource)

    } catch (err) {
        console.log(err)
        next(err)
    }
}

export const getResourcesByCategory=async(req,res,next)=>{
    const category= req.query.category
    try {
        const resources= await resourceModel.find({category}).sort({createdAt:-1})
        const userData=JSON.parse(req.cookies.userData)
        res.render("home.ejs", {resources,userData})
    } catch (err) {
        next(err)
    }
}

export const getResourcesWithUserId= async(req,res,next)=>{
    try {
        const resources= await resourceModel.find({userId:req.user.id})
        res.status(200).json(resources)

    } catch (err) {
        next(err)
        
    }
}

export const getAllResources= async(req,res,next)=>{
    if(!req.cookies.access_token){
        res.redirect("/auth")
    } 
    try {
        const resources= await resourceModel.find().sort({createdAt:-1})
        //const userData= JSON.parse(localStorage.getItem("userData"))
        const userData=JSON.parse(req.cookies.userData)
        res.render("home.ejs", {resources,userData})
    } catch (err) {
        next(err)
        
    }
}

export const searchForResources= async(req,res,next)=>{
    try {
        const q=req.query.q
        const resources= await resourceModel.find({
            resourceName:{$regex:q, $options:"i"}
        }).limit(20)

        res.status(200).json(resources)
    } catch (err) {
        next(err)
        
    }
}