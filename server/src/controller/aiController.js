import OpenAI from "openai";
import Creations from "../model/Creations.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'
import FormData from 'form-data'
import sharp from 'sharp';
// server.js - top of file
// ✅ Groq - Free tier, no billing needed
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;
        console.log(free_usage+"---"+plan)
        if (plan != 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "limit reached upgrade to premium to continue." })
        }

        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 5000
        });

        const content = response.choices[0].message.content;
        await Creations.create({ user_id: userId, prompt, content, type: 'article' });

        if (plan !== 'premium' && free_usage >= 10) {
            await clerkClient.users.updateUserMetadata(userId, { privateMetadata: { free_usage: free_usage + 1 } })
        }

        res.json({ success: true, content });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan != 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "limit reached upgrade to premium to continue." })
        }

        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1000
        });

        const content = response.choices[0].message.content;
        await Creations.create({ user_id: userId, prompt, content, type: 'blog-title' });

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, { privateMetadata: { free_usage: free_usage + 1 } })
        }

        res.json({ success: true, content });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;

        // ✅ Pollinations AI - Zero setup, No API key, Completely Free
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;
        // if (plan != 'premium' && free_usage >= 10) {
        //     return res.json({ success: false, message: "limit reached upgrade to premium to continue." })
        // }
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 60000
        });

        const base64Image = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`;
        const { secure_url } = await cloudinary.uploader.upload(base64Image);

        await Creations.create({ user_id: userId, prompt, content: secure_url, type: 'image', publish });

        res.json({ success: true, content: secure_url });

    } catch (error) {
        console.log("Image Gen Error:", error.response?.data || error.message);
        res.json({ success: false, message: error.message });
    }
};

// ✅ Remove Background - Using remove.bg API
export const removeBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const plan = req.plan;
        const free_usage = req.free_usage;
        console.log("File info:", {
            originalname: image.originalname,
            mimetype: image.mimetype,
            size: image.size,
            path: image.path
        });

        const ext = image.originalname.split('.').pop().toLowerCase();
        const mimeMap = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp'
        };
        const correctMime = mimeMap[ext] || image.mimetype;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(correctMime)) {
            return res.json({ success: false, message: "Only JPG, PNG, and WEBP images are supported." });
        }

        const imageBuffer = fs.readFileSync(image.path);

        const formData = new FormData();
        formData.append('image_file', imageBuffer, {
            filename: `image.${ext}`,
            contentType: correctMime,
        });
        formData.append('size', 'auto');
        if (plan != 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "limit reached upgrade to premium to continue." })
        }
        const response = await axios.post(
            'https://api.remove.bg/v1.0/removebg',
            formData,
            {
                headers: {
                    'X-Api-Key': process.env.REMOVEBG_API_KEY,
                    ...formData.getHeaders()
                },
                responseType: 'arraybuffer'
            }
        );

        const contentType = response.headers['content-type'];
        if (contentType.includes('application/json')) {
            const errorMsg = JSON.parse(Buffer.from(response.data).toString('utf8'));
            return res.json({ success: false, message: errorMsg.errors?.[0]?.title || 'Remove BG failed' });
        }

        const base64Image = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`;
        const { secure_url } = await cloudinary.uploader.upload(base64Image);

        fs.unlinkSync(image.path);

        await Creations.create({ user_id: userId, prompt: 'Remove background from image', content: secure_url, type: 'image' });

        res.json({ success: true, content: secure_url });

    } catch (error) {
        if (error.response?.data) {
            const errMsg = Buffer.from(error.response.data).toString('utf8');
            console.log("Remove BG Error:", errMsg);
            try {
                const parsed = JSON.parse(errMsg);
                return res.json({ success: false, message: parsed.errors?.[0]?.title || 'Remove BG failed' });
            } catch {
                return res.json({ success: false, message: errMsg });
            }
        }
        console.log("Remove BG Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// ✅ Remove Object - Using Cloudinary AI

export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const { object } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;
        if (plan != 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "limit reached upgrade to premium to continue." })
        }

        // ✅ Upload original image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(image.path, {
            resource_type: 'image'
        });

        fs.unlinkSync(image.path);

        // ✅ Apply gen_remove transformation — no mask needed, just object name
        const image_url = cloudinary.url(uploadResult.public_id, {
            transformation: [
                { effect: `gen_remove:prompt_${object}` }
            ],
            resource_type: 'image',
            secure: true
        });

        await Creations.create({
            user_id: userId,
            prompt: `Remove ${object} from image`,
            content: image_url,
            type: 'image'
        });

        res.json({ success: true, content: image_url });

    } catch (error) {
        console.log("Remove Object Error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// ✅ Resume Review - Using Groq (Free, no billing)
export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const plan = req.plan;
        const free_usage = req.free_usage;
        const resume = req.file;
        if (plan != 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "limit reached upgrade to premium to continue." })
        }
        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: 'Resume file size exceeds allowed size (5MB)' })
        }

        const dataBuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(dataBuffer);
        fs.unlinkSync(resume.path);

        const prompt = `Review the following resume and provide structured feedback with:
        1. ⭐ Overall Score (out of 100)
        2. ✅ Key Strengths (bullet points)
        3. ❌ Weaknesses (bullet points)
        4. 💡 Improvement Suggestions (bullet points)
        5. 🤖 ATS Compatibility Score (out of 100) with tips
        6. 🎯 Best Job Roles that match this resume
        
        Resume Content:\n\n${pdfData.text}`;

        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 3000
        });

        const content = response.choices[0].message.content;

        if (!content) {
            return res.json({ success: false, message: "No response from AI." });
        }

        await Creations.create({ user_id: userId, prompt: `Review the uploaded resume`, content, type: 'resume-review' });

        res.json({ success: true, content });

    } catch (error) {
        console.log("Resume Review Error:", JSON.stringify(error.response?.data, null, 2) || error.message);
        res.json({ success: false, message: error.response?.data?.error?.message || error.message });
    }
}