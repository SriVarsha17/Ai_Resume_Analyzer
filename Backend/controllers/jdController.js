const JobDescription = require("../models/JobDescriptionModel");

/**
 * @desc    Create and save a new job description
 * @route   POST /api/jd
 * @access  Private
 */
const createJobDescription = async (req, res, next) => {
  try {
    const { title, company, descriptionText } = req.body;

    if (!title || !descriptionText) {
      res.status(400);
      throw new Error("Job title and description text are required");
    }

    const jd = await JobDescription.create({
      user: req.user._id,
      title,
      company: company || "",
      descriptionText,
    });

    res.status(201).json({
      success: true,
      message: "Job description saved successfully",
      data: jd,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all job descriptions created by the user
 * @route   GET /api/jd/user/all
 * @access  Private
 */
const getAllJobDescriptions = async (req, res, next) => {
  try {
    const jds = await JobDescription.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jds.length,
      data: jds,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a specific job description
 * @route   DELETE /api/jd/:id
 * @access  Private
 */
const deleteJobDescription = async (req, res, next) => {
  try {
    const jd = await JobDescription.findOne({ _id: req.params.id, user: req.user._id });

    if (!jd) {
      res.status(404);
      throw new Error("Job description not found or access denied");
    }

    await jd.deleteOne();

    res.json({
      success: true,
      message: "Job description deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJobDescription,
  getAllJobDescriptions,
  deleteJobDescription,
};
