import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    place: { type: String, required: true },
    details: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approved: { type: Boolean, default: false },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Keeping a small resume file in the application record makes it persist in MongoDB.
    applications: [
      {
        candidate: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        resumeName: { type: String, required: true },
        resumeType: { type: String, required: true },
        resumeData: { type: Buffer, required: true },
        appliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Job", jobSchema);
