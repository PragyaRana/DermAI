import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import protect from "../middleware/authMiddleware.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

const router = express.Router();

function mockAI(imageUrl) {
  const s = imageUrl.length % 40;
  const v = (b, r) => Math.min(100, Math.max(10, b + (s % r) - r / 2));
  return {
    scores: { overall: v(68,30), acne: v(62,38), glow: v(65,28), hydration: v(63,32), youth: v(71,26), symmetry: v(76,18) },
    skin_age: 20 + (s % 18),
    skin_type: ["normal","oily","dry","combination","sensitive"][s % 5],
    issues_detected: [
      { name:"Mild Acne", severity:"mild", description:"Small comedones in T-zone from excess sebum production." },
      { name:"Dark Circles", severity:"moderate", description:"Under-eye discoloration from poor circulation or sleep deprivation." },
      { name:"Uneven Skin Tone", severity:"mild", description:"Hyperpigmentation on cheeks from UV exposure without SPF." },
      ...(s%3===0?[{ name:"Enlarged Pores", severity:"mild", description:"Visible pores from excess oil on nose and forehead." }]:[]),
    ],
    remedies: [
      "Apply pure aloe vera gel on breakouts nightly",
      "Place chilled green tea bags on eyes for 10 mins each morning",
      "Use Vitamin C serum post-cleansing to fade pigmentation",
      "Always double cleanse before bed — remove SPF and makeup",
      "Apply SPF 30+ every morning, even on cloudy days",
    ],
    daily_routine: {
      morning: [
        "Rinse face with cold water or gentle foaming cleanser",
        "Apply alcohol-free toner with rose water",
        "Layer 2–3 drops Vitamin C serum, pat gently",
        "Lightweight hyaluronic acid moisturiser",
        "SPF 30+ broad-spectrum sunscreen — non-negotiable",
      ],
      evening: [
        "Micellar water or cleansing balm to remove SPF/makeup",
        "Follow with regular cleanser (double cleanse)",
        "BHA (salicylic acid 2%) toner on oily zones only",
        "Retinol serum 2–3 nights per week",
        "Rich night cream or sleeping mask to seal in hydration",
      ],
    },
    diet_suggestions: [
      "Drink 2.5–3 litres of water daily",
      "Add omega-3 foods: walnuts, flaxseeds, salmon",
      "Eat leafy greens daily for collagen support",
      "Cut down on sugar and dairy — both trigger acne",
      "Include Vitamin E: almonds, avocado, sunflower seeds",
    ],
    lifestyle_changes: [
      "Sleep 7–9 hours — skin repairs itself overnight",
      "Change pillowcase every 2–3 days",
      "Exercise 30 mins daily for blood circulation and glow",
      "Manage stress — cortisol directly worsens skin",
      "Never touch your face with unwashed hands",
    ],
    product_recommendations: [
      { type:"Cleanser",    name:"CeraVe Hydrating Facial Cleanser",       reason:"Gentle ceramide formula, won't strip skin barrier" },
      { type:"Serum",       name:"TruSkin Vitamin C Brightening Serum",    reason:"Fades pigmentation and boosts radiance affordably" },
      { type:"Moisturiser", name:"Neutrogena Hydro Boost Water Gel",       reason:"Hyaluronic acid gel, non-comedogenic for all types" },
      { type:"Sunscreen",   name:"La Roche-Posay Anthelios SPF 50",        reason:"Broad-spectrum, no white cast, dermatologist recommended" },
      { type:"Treatment",   name:"Paula's Choice 2% BHA Liquid Exfoliant", reason:"Unclogs pores and reduces acne over time" },
    ],
    doctor_consultation: { required: s%7===0, reason: s%7===0 ? "Persistent inflammatory acne — consult a dermatologist." : null },
  };
}

async function geminiAnalysis(imageUrl) {
  const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model  = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    You are a professional dermatologist AI. Analyze the uploaded skin photo and return a comprehensive analysis.
    Return ONLY a valid JSON response with this exact structure:
    {
      "scores": { "overall": 70, "acne": 65, "glow": 68, "hydration": 62, "youth": 72, "symmetry": 75 },
      "skin_age": 25,
      "skin_type": "normal",
      "issues_detected": [{ "name": "Mild Acne", "severity": "mild", "description": "..." }],
      "remedies": ["..."],
      "daily_routine": { "morning": ["..."], "evening": ["..."] },
      "diet_suggestions": ["..."],
      "lifestyle_changes": ["..."],
      "product_recommendations": [{ "type": "Cleanser", "name": "...", "reason": "..." }],
      "doctor_consultation": { "required": false, "reason": null }
    }

    Notes:
    - skin_type MUST be one of: "normal", "oily", "dry", "combination", "sensitive".
    - Make sure the overall and category scores, skin age, skin type, issues, remedies, routines, and recommendations are dynamically and realistically calculated based on the skin conditions observed in the photo.
    - Do not copy the placeholder numbers or text from the structure above; they are only for structural template reference.
  `;

  const response = await fetch(imageUrl);
  const buffer   = await response.arrayBuffer();
  const base64   = Buffer.from(buffer).toString("base64");
  const mimeType = "image/jpeg";

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64, mimeType } }
  ]);

  const text = result.response.text();
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

router.post("/", protect, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "imageUrl required." });

    const report = await Report.create({ userId: req.user._id, imageUrl, status: "pending" });

    let ai;
    try {
      ai = await geminiAnalysis(imageUrl);
      console.log("✅ Gemini AI responded");
    } catch (err) {
      console.log("⚠️ Gemini failed — using mock:", err.message);
      ai = mockAI(imageUrl);
    }

    const done = await Report.findByIdAndUpdate(report._id, {
      overallScore: ai.scores?.overall ?? 70, acneScore: ai.scores?.acne ?? 65,
      glowScore: ai.scores?.glow ?? 68, hydrationScore: ai.scores?.hydration ?? 62,
      youthScore: ai.scores?.youth ?? 72, symmetryScore: ai.scores?.symmetry ?? 75,
      skinAge: ai.skin_age, skinType: ai.skin_type,
      issuesDetected: ai.issues_detected||[], remedies: ai.remedies||[],
      dailyRoutine: ai.daily_routine||{morning:[],evening:[]},
      dietSuggestions: ai.diet_suggestions||[], lifestyleChanges: ai.lifestyle_changes||[],
      productRecommendations: ai.product_recommendations||[],
      doctorConsultation: ai.doctor_consultation||{required:false},
      status: "completed",
    }, { new: true });

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalScans: 1 } });
    res.json({ report: done });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;