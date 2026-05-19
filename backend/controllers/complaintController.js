const Complaint = require("../models/Complaint");

const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

// POST /api/complaints
const addComplaint = async (req, res) => {
  try {
    const { name, email, title, description, category, location, status } =
      req.body;

    if (!name || !email || !title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide name, email, title, description, category, and location",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const complaint = await Complaint.create({
      name,
      email: email.toLowerCase(),
      title,
      description,
      category,
      location,
      status: status || "Pending",
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Complaint stored successfully",
      complaint,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A complaint with this email already exists",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add complaint",
      error: error.message,
    });
  }
};

// GET /api/complaints
const getAllComplaints = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    if (status) {
      filter.status = { $regex: status, $options: "i" };
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Complaints fetched successfully",
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
};

// GET /api/complaints/search?location=Ghaziabad
const searchComplaintsByLocation = async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Please provide location query parameter",
      });
    }

    const complaints = await Complaint.find({
      location: { $regex: location, $options: "i" },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: `Complaints found for location: ${location}`,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message,
    });
  }
};

// PUT /api/complaints/:id
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, title, description, category, location, status } =
      req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (email && !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (name) complaint.name = name;
    if (email) complaint.email = email.toLowerCase();
    if (title) complaint.title = title;
    if (description) complaint.description = description;
    if (category) complaint.category = category;
    if (location) complaint.location = location;
    if (status) complaint.status = status;

    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already used by another complaint",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update complaint",
      error: error.message,
    });
  }
};

// DELETE /api/complaints/:id
const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint removed successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete complaint",
      error: error.message,
    });
  }
};

module.exports = {
  addComplaint,
  getAllComplaints,
  searchComplaintsByLocation,
  updateComplaint,
  deleteComplaint,
};
