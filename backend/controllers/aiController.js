const axios = require("axios");
const Complaint = require("../models/Complaint");

const HIGH_PRIORITY_KEYWORDS = [
  "electricity",
  "fire",
  "accident",
  "emergency",
  "gas leak",
  "collapse",
  "flood",
  "injury",
  "short circuit",
  "power outage",
];

const computeAnalytics = (complaints) => {
  const totalComplaints = complaints.length;

  const categoryBreakdown = {};
  const locationAnalysis = {};
  let pendingComplaints = 0;
  let resolvedComplaints = 0;
  const highPriorityComplaints = [];

  complaints.forEach((complaint) => {
    const category = complaint.category || "Unknown";
    const location = complaint.location || "Unknown";
    const status = complaint.status || "Pending";

    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    locationAnalysis[location] = (locationAnalysis[location] || 0) + 1;

    if (status === "Pending" || status === "In Progress") {
      pendingComplaints += 1;
    }

    if (status === "Resolved") {
      resolvedComplaints += 1;
    }

    const text = `${complaint.title} ${complaint.description} ${complaint.category}`.toLowerCase();
    const isHighPriority = HIGH_PRIORITY_KEYWORDS.some((keyword) =>
      text.includes(keyword)
    );

    if (isHighPriority) {
      highPriorityComplaints.push({
        id: complaint._id,
        title: complaint.title,
        category: complaint.category,
        location: complaint.location,
        status: complaint.status,
      });
    }
  });

  return {
    totalComplaints,
    pendingComplaints,
    resolvedComplaints,
    highPriorityCount: highPriorityComplaints.length,
    categoryBreakdown,
    locationAnalysis,
    highPriorityComplaints,
  };
};

const buildComplaintContext = (complaints) => {
  if (!complaints.length) {
    return "No complaints available in the database.";
  }

  return complaints
    .map(
      (c, index) =>
        `Complaint ${index + 1}:
Name: ${c.name}
Email: ${c.email}
Title: ${c.title}
Description: ${c.description}
Category: ${c.category}
Location: ${c.location}
Status: ${c.status}
Created At: ${c.createdAt}`
    )
    .join("\n\n");
};

const callOpenRouterAI = async (userPrompt) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert civic complaint analysis AI.

Always return structured markdown with EXACTLY these headers:

## Complaint Summary

## Priority Detection

## Department Recommendation

## Suggested Response

## Action Steps

Be specific and use complaint data.`,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.4,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-complaint-management.onrender.com",
        "X-Title": "AI Complaint Management System",
      },
      timeout: 120000,
    }
  );

  return (
    response.data?.choices?.[0]?.message?.content ||
    "AI analysis could not be generated."
  );
};

// POST /api/ai/analyze
const analyzeAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });

    const computedAnalytics = computeAnalytics(complaints);
    const complaintContext = buildComplaintContext(complaints);

    const userPrompt = `Analyze the following complaint dataset and provide civic management insights.

Computed Analytics:
${JSON.stringify(computedAnalytics, null, 2)}

Complaint Records:
${complaintContext}

Tasks:
1. Detect urgency for important complaints
2. Recommend responsible departments
3. Summarize overall complaint situation
4. Generate automatic response suggestions
5. Suggest actionable next steps for administration`;

    const aiAnalysis = await callOpenRouterAI(userPrompt);

    return res.status(200).json({
      success: true,
      message: "AI complaint analysis completed successfully",
      complaintCount: complaints.length,
      computedAnalytics,
      complaints,
      aiAnalysis,
    });
  } catch (error) {
    const aiError =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message;

    return res.status(500).json({
      success: false,
      message: "AI analysis failed",
      error: aiError,
    });
  }
};

// POST /api/ai/analyze/:id
const analyzeSingleComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    const complaints = [complaint];
    const computedAnalytics = computeAnalytics(complaints);
    const complaintContext = buildComplaintContext(complaints);

    const userPrompt = `Analyze this single complaint in detail.

Computed Analytics:
${JSON.stringify(computedAnalytics, null, 2)}

Complaint Record:
${complaintContext}

Tasks:
1. Detect urgency level
2. Recommend the most suitable government department
3. Summarize the complaint clearly
4. Generate an automatic user response message
5. Provide step-by-step action recommendations`;

    const aiAnalysis = await callOpenRouterAI(userPrompt);

    return res.status(200).json({
      success: true,
      message: "Single complaint AI analysis completed successfully",
      complaintCount: 1,
      computedAnalytics,
      complaints,
      aiAnalysis,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    const aiError =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message;

    return res.status(500).json({
      success: false,
      message: "AI analysis failed",
      error: aiError,
    });
  }
};

module.exports = { analyzeAllComplaints, analyzeSingleComplaint };
