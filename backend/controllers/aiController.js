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
  "spark",
  "hazard",
];

const DEPARTMENT_MAP = {
  "water supply": "Municipal Water & Sewerage Department",
  water: "Municipal Water & Sewerage Department",
  electricity: "Electricity Board / Power Distribution Department",
  power: "Electricity Board / Power Distribution Department",
  sanitation: "Municipal Sanitation & Waste Management Department",
  garbage: "Municipal Sanitation & Waste Management Department",
  waste: "Municipal Sanitation & Waste Management Department",
  roads: "Public Works Department (PWD)",
  road: "Public Works Department (PWD)",
  health: "Public Health & Medical Services Department",
  hospital: "Public Health & Medical Services Department",
};

const detectUrgency = (complaint) => {
  const text = `${complaint.title} ${complaint.description} ${complaint.category}`.toLowerCase();
  const high = HIGH_PRIORITY_KEYWORDS.some((k) => text.includes(k));
  if (high) return { level: "Critical", score: 95, color: "red" };
  if (complaint.status === "Pending" && text.length > 200) return { level: "High", score: 75, color: "orange" };
  if (complaint.category?.toLowerCase().includes("electricity")) return { level: "High", score: 80, color: "orange" };
  if (complaint.status === "In Progress") return { level: "Medium", score: 50, color: "yellow" };
  if (complaint.status === "Resolved") return { level: "Low", score: 20, color: "green" };
  return { level: "Medium", score: 55, color: "yellow" };
};

const suggestDepartment = (complaint) => {
  const text = `${complaint.category} ${complaint.title} ${complaint.description}`.toLowerCase();
  for (const [key, dept] of Object.entries(DEPARTMENT_MAP)) {
    if (text.includes(key)) return dept;
  }
  return "General Civic Administration & Grievance Cell";
};

const computeAnalytics = (complaints) => {
  const categoryBreakdown = {};
  const locationAnalysis = {};
  const urgencyBreakdown = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const departmentLoad = {};
  let pendingComplaints = 0;
  let resolvedComplaints = 0;
  let inProgressComplaints = 0;
  const highPriorityComplaints = [];
  const complaintInsights = [];

  complaints.forEach((complaint) => {
    const category = complaint.category || "Unknown";
    const location = complaint.location || "Unknown";
    const status = complaint.status || "Pending";
    const urgency = detectUrgency(complaint);
    const department = suggestDepartment(complaint);

    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    locationAnalysis[location] = (locationAnalysis[location] || 0) + 1;
    departmentLoad[department] = (departmentLoad[department] || 0) + 1;
    urgencyBreakdown[urgency.level] = (urgencyBreakdown[urgency.level] || 0) + 1;

    if (status === "Pending") pendingComplaints += 1;
    if (status === "Resolved") resolvedComplaints += 1;
    if (status === "In Progress") inProgressComplaints += 1;

    if (urgency.level === "Critical" || urgency.level === "High") {
      highPriorityComplaints.push({
        id: complaint._id,
        title: complaint.title,
        category: complaint.category,
        location: complaint.location,
        status: complaint.status,
        urgency: urgency.level,
        recommendedDepartment: department,
      });
    }

    complaintInsights.push({
      id: complaint._id,
      title: complaint.title,
      urgency: urgency.level,
      urgencyScore: urgency.score,
      recommendedDepartment: department,
      status,
    });
  });

  const totalComplaints = complaints.length;
  const resolutionRate =
    totalComplaints > 0
      ? Math.round((resolvedComplaints / totalComplaints) * 100)
      : 0;

  return {
    totalComplaints,
    pendingComplaints,
    resolvedComplaints,
    inProgressComplaints,
    resolutionRate: `${resolutionRate}%`,
    highPriorityCount: highPriorityComplaints.length,
    categoryBreakdown,
    locationAnalysis,
    urgencyBreakdown,
    departmentLoad,
    highPriorityComplaints,
    complaintInsights,
  };
};

const buildComplaintContext = (complaints) => {
  if (!complaints.length) return "No complaints in database.";

  return complaints
    .map((c, i) => {
      const urgency = detectUrgency(c);
      const dept = suggestDepartment(c);
      return `--- Complaint #${i + 1} ---
ID: ${c._id}
Citizen: ${c.name} (${c.email})
Title: ${c.title}
Description: ${c.description}
Category: ${c.category}
Location: ${c.location}
Status: ${c.status}
AI Pre-Score Urgency: ${urgency.level} (${urgency.score}/100)
Suggested Department: ${dept}
Submitted: ${c.createdAt}`;
    })
    .join("\n\n");
};

const SYSTEM_PROMPT = `You are an elite AI Civic Complaint Intelligence Officer for India's smart city grievance management system.

STRICT OUTPUT RULES:
1. Use EXACTLY these markdown headers (copy spelling exactly):
## Complaint Summary
## Priority Detection
## Department Recommendation
## Suggested Response
## Action Steps

2. Each section MUST be detailed (minimum 4-6 bullet points or 3-4 full sentences).
3. Reference REAL complaint titles, locations, categories, and citizen issues from the data.
4. For Priority Detection: assign levels (Critical/High/Medium/Low), explain WHY, mention safety risks.
5. For Department Recommendation: name specific government departments, escalation hierarchy, SLA timelines.
6. For Suggested Response: write a professional, empathetic citizen reply (150+ words) ready to send via email/SMS.
7. For Action Steps: numbered steps for field teams with timelines (24h, 48h, 72h).
8. Use Indian civic context (Municipal Corporation, Ward Officer, Jal Board, etc.) where relevant.
9. If water leakage → Water Department. Electricity/sparking → Power Board HIGH priority. Garbage → Sanitation.
10. Be actionable, professional, and exam-report quality.`;

const callOpenRouterAI = async (userPrompt) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.35,
      max_tokens: 2500,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://harshdubey-endsem.onrender.com",
        "X-Title": "AI Smart Complaint Management",
      },
      timeout: 120000,
    }
  );

  return (
    response.data?.choices?.[0]?.message?.content ||
    "AI analysis could not be generated."
  );
};

const buildAnalysisPrompt = (complaints, computedAnalytics, mode) => {
  const complaintContext = buildComplaintContext(complaints);

  return `MODE: ${mode}
TOTAL COMPLAINTS: ${complaints.length}

PRE-COMPUTED ANALYTICS (use these facts in your analysis):
${JSON.stringify(computedAnalytics, null, 2)}

RAW COMPLAINT RECORDS:
${complaintContext}

INSTRUCTIONS:
- Provide deep, professional analysis suitable for a government dashboard report.
- Mention specific complaint titles and locations by name.
- Highlight critical/urgent cases first.
- Include estimated resolution timelines and inter-department coordination needs.
- Make Suggested Response sound like an official civic body communication.`;
};

const analyzeAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    const computedAnalytics = computeAnalytics(complaints);
    const userPrompt = buildAnalysisPrompt(
      complaints,
      computedAnalytics,
      "FULL DATASET ANALYSIS — All registered complaints"
    );

    const aiAnalysis = await callOpenRouterAI(userPrompt);

    return res.status(200).json({
      success: true,
      message: "Advanced AI complaint intelligence report generated",
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
    const userPrompt = buildAnalysisPrompt(
      complaints,
      computedAnalytics,
      "SINGLE COMPLAINT DEEP-DIVE"
    );

    const aiAnalysis = await callOpenRouterAI(userPrompt);

    return res.status(200).json({
      success: true,
      message: "Single complaint AI deep analysis completed",
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
