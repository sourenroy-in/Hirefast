import { Router } from "express";
import multer from "multer";
import Job from "../models/Job.js";
import { loginNeeded, roleNeeded } from "../middleware/login.js";

const router = Router();
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Keep each resume at 5 MB or less.
  fileFilter(req, file, done) {
    const types = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (types.includes(file.mimetype)) return done(null, true);
    const error = new Error("Upload a PDF, DOC or DOCX file");
    error.status = 400;
    done(error);
  },
});

// Everyone can see approved jobs.
router.get("/", async (req, res) => {
  const jobs = await Job.find({ approved: true })
    .populate("owner", "name")
    .sort({ createdAt: -1 });
  res.json(jobs);
});

router.post("/", loginNeeded, roleNeeded("recruiter"), async (req, res) => {
  const { title, company, place, details } = req.body;
  if (!title || !company || !place || !details)
    return res.status(400).json({ message: "Fill in every box" });
  const job = await Job.create({
    title,
    company,
    place,
    details,
    owner: req.user.id,
  });
  res.status(201).json(job);
});

router.get("/mine", loginNeeded, roleNeeded("recruiter"), async (req, res) => {
  res.json(
    await Job.find({ owner: req.user.id })
      // Send resume metadata here; the file bytes are downloaded only on demand.
      .select("-applications.resumeData")
      .populate("applicants", "name email")
      .populate("applications.candidate", "name email")
      .sort({ createdAt: -1 }),
  );
});

// Job seekers can check the jobs they have applied for.
router.get("/applied", loginNeeded, roleNeeded("seeker"), async (req, res) => {
  const jobs = await Job.find({ applicants: req.user.id })
    .select("-applications.resumeData")
    .populate("owner", "name")
    .sort({ createdAt: -1 });
  // Older applications may have an applicant but no resume record yet.
  res.json(
    jobs.map((job) => {
      const application = job.applications.find(
        (item) => item.candidate.toString() === req.user.id,
      );
      return {
        ...job.toObject(),
        resumeUploaded: Boolean(application?.resumeName),
      };
    }),
  );
});

// Admins use this list to review applications from every job.
router.get(
  "/applications",
  loginNeeded,
  roleNeeded("admin"),
  async (req, res) => {
    res.json(
      await Job.find({
        $or: [
          { "applications.0": { $exists: true } },
          { "applicants.0": { $exists: true } },
        ],
      })
        .select("-applications.resumeData")
        .populate("applicants", "name email")
        .populate("owner", "name")
        .populate("applications.candidate", "name email")
        .sort({ createdAt: -1 }),
    );
  },
);

router.post(
  "/:id/apply",
  loginNeeded,
  roleNeeded("seeker"),
  resumeUpload.single("resume"),
  async (req, res) => {
    if (!req.file)
      return res.status(400).json({ message: "Please attach your resume" });
    const job = await Job.findOne({ _id: req.params.id, approved: true });
    if (!job) return res.status(404).json({ message: "Job not found" });
    const alreadyApplied = job.applicants.some(
      (personId) => personId.toString() === req.user.id,
    );
    const oldApplication = job.applications.find(
      (item) => item.candidate.toString() === req.user.id,
    );
    if (oldApplication?.resumeData?.length) {
      return res.status(400).json({ message: "You already applied with a resume" });
    }

    if (!alreadyApplied) job.applicants.push(req.user.id);
    const resumeInfo = {
      resumeName: req.file.originalname,
      resumeType: req.file.mimetype,
      resumeData: req.file.buffer,
    };
    if (oldApplication) {
      Object.assign(oldApplication, resumeInfo);
    } else {
      job.applications.push({ candidate: req.user.id, ...resumeInfo });
    }
    await job.save();
    res.json({
      message: alreadyApplied
        ? "Resume added to your existing application"
        : "Application and resume sent",
    });
  },
);

router.get(
  "/:jobId/applications/:applicationId/resume",
  loginNeeded,
  async (req, res) => {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    const isAdmin = req.user.role === "admin";
    const isOwner =
      req.user.role === "recruiter" && job.owner.toString() === req.user.id;
    if (!isAdmin && !isOwner)
      return res.status(403).json({ message: "You cannot view this resume" });

    const application = job.applications.id(req.params.applicationId);
    if (!application)
      return res.status(404).json({ message: "Resume not found" });
    const safeName = application.resumeName.replace(/[\\/\r\n"]/g, "_");
    res
      .type(application.resumeType)
      .attachment(safeName)
      .send(application.resumeData);
  },
);

router.get("/review", loginNeeded, roleNeeded("admin"), async (req, res) => {
  res.json(
    await Job.find({ approved: false })
      .populate("owner", "name")
      .sort({ createdAt: 1 }),
  );
});

router.patch(
  "/:id/approve",
  loginNeeded,
  roleNeeded("admin"),
  async (req, res) => {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true },
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job approved" });
  },
);

router.delete("/:id", loginNeeded, async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: "Job not found" });

  // Admins can remove any post. Recruiters can remove only their own.
  const isAdmin = req.user.role === "admin";
  const isOwner =
    req.user.role === "recruiter" && job.owner.toString() === req.user.id;
  if (!isAdmin && !isOwner)
    return res.status(403).json({ message: "You cannot remove this job" });

  await job.deleteOne();
  res.json({ message: "Job removed" });
});

export default router;
