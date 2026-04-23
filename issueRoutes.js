const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const { protect } = require('./authMiddleware');
const upload = require('./middleware/upload');


// ==========================
// 🤖 PRIORITY PREDICTION
// ==========================
const predictPriority = (text) => {
    text = text.toLowerCase();

    const highKeywords = [
        "accident", "crash", "collision", "fire", "explosion",
        "short circuit", "electric shock", "live wire",
        "danger", "hazard", "emergency", "injury", "dead",
        "flood", "waterlogging", "gas leak", "building collapse",
        "earthquake", "blast", "severe", "critical"
    ];

    const mediumKeywords = [
        "pothole", "road damage", "water leakage", "pipe burst",
        "drain blockage", "garbage overflow", "dirty water",
        "street light not working", "electric issue", "power cut",
        "traffic jam", "broken signal", "noise", "pollution",
        "sewage problem", "dust", "maintenance"
    ];

    for (let word of highKeywords) {
        if (text.includes(word)) return "High";
    }

    for (let word of mediumKeywords) {
        if (text.includes(word)) return "Medium";
    }

    return "Low";
};


// ==========================
// 🤖 DEPARTMENT PREDICTION
// ==========================
const predictDepartment = (text) => {
    text = text.toLowerCase();

    if (text.includes("road") || text.includes("pothole") || text.includes("traffic")) {
        return "Road Department";
    }

    if (text.includes("garbage") || text.includes("waste") || text.includes("clean")) {
        return "Sanitation Department";
    }

    if (text.includes("electric") || text.includes("power") || text.includes("light")) {
        return "Electricity Department";
    }

    if (text.includes("water") || text.includes("pipe") || text.includes("leak")) {
        return "Water Department";
    }

    if (text.includes("crime") || text.includes("theft") || text.includes("violence")) {
        return "Police Department";
    }

    return "General Department";
};


// ==========================
// ✅ SUBMIT ISSUE (CREATE)
// ==========================
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);

       const { title, description, category, latitude, longitude } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const text = `${title} ${description}`;

        const priority = predictPriority(text);
        const department = predictDepartment(text);

        const newIssue = await Issue.create({
            title,
            description,
            category,
            priority,
            department,
            image: req.file ? req.file.filename : null,
            location: {
                latitude,
                longitude
              },
             userId: req.user.id
        });

        res.status(201).json({
            success: true,
            message: "Issue submitted successfully",
            issue: newIssue,
            imageUrl: req.file
            ? `https://civic-issues-backend-odtv.onrender.com/uploads/${req.file.filename}`
                : null
        });

    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Error submitting issue"
        });
    }
});


// ==========================
// ✅ GET ALL ISSUES (ADMIN)
// ==========================
router.get('/all', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Admin only"
            });
        }

        const issues = await Issue.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            issues
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching issues"
        });
    }
});


// ==========================
// ✅ GET MY ISSUES
// ==========================
router.get('/my', protect, async (req, res) => {
    try {
        const issues = await Issue.find({ userId: req.user.id });

        res.json({
            success: true,
            issues
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching issues"
        });
    }
});


// ==========================
// ✅ UPDATE ISSUE (ADMIN)
// ==========================
router.put('/:id', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Admin only"
            });
        }

        const { status, priority, department } = req.body;

        const updatedIssue = await Issue.findByIdAndUpdate(
            req.params.id,
            { status, priority, department },
            { new: true }
        );

        res.json({
            success: true,
            issue: updatedIssue
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating issue"
        });
    }
});


// ==========================
// ✅ DELETE ISSUE (ADMIN)
// ==========================
router.delete('/:id', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Admin only"
            });
        }

        await Issue.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Issue deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting issue"
        });
    }
});

module.exports = router;