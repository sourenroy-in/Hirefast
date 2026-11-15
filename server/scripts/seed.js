import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Job from "../models/Job.js";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/hirefast";
const demoPassword = "HireFast123!";

async function upsertUser({ name, email, role }) {
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    existing.name = name;
    existing.role = role;
    await existing.save();
    return existing;
  }
  return User.create({
    name,
    email: normalizedEmail,
    role,
    password: await bcrypt.hash(demoPassword, 10),
  });
}

try {
  await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 5000 });
  const recruiter = await upsertUser({
    name: "Morgan Recruiter",
    email: "recruiter@hirefast.com",
    role: "recruiter",
  });
  await upsertUser({
    name: "Sam Seeker",
    email: "seeker@hirefast.com",
    role: "seeker",
  });
  await upsertUser({
    name: "Avery Admin",
    email: "admin@hirefast.com",
    role: "admin",
  });

  const sampleJobs = [
    {
      title: "Junior Full Stack Developer",
      company: "Northstar Labs",
      place: "Kolkata · Hybrid",
      details:
        "Help build customer-facing React features and Node.js APIs. Suitable for an early-career developer who enjoys learning with a team.",
      approved: true,
    },
    {
      title: "Frontend Developer Intern",
      company: "BrightPath Digital",
      place: "Remote",
      details:
        "Work with the product team on accessible React interfaces. Familiarity with JavaScript, CSS, and Git is helpful.",
      approved: true,
    },
    {
      title: "Backend Engineer",
      company: "Riverstone Tech",
      place: "Kolkata · On-site",
      details:
        "Build and maintain Node.js services, MongoDB data models, and reliable REST APIs.",
      approved: false,
    },
  ];

  let created = 0;
  for (const sample of sampleJobs) {
    const existing = await Job.findOne({
      owner: recruiter._id,
      title: sample.title,
      company: sample.company,
    });
    if (existing) {
      Object.assign(existing, sample);
      await existing.save();
    } else {
      await Job.create({ ...sample, owner: recruiter._id });
      created += 1;
    }
  }

  console.log(`Sample data ready in database "${mongoose.connection.name}".`);
  console.log(`Created ${created} jobs; existing sample jobs were updated.`);
  console.log(`New demo accounts use password: ${demoPassword}`);
  console.log("Accounts: recruiter@hirefast.com, seeker@hirefast.com, admin@hirefast.com");
  console.log("Existing accounts keep their current passwords.");
} catch (error) {
  console.error("Could not seed MongoDB:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
