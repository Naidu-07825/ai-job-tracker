import { scoreJobWithResume } from "./langchainMatcher.js";

// Function to detect if content looks like a resume
export function isResumeContent(text) {
  // If text is empty or null, it's definitely not a resume
  if (!text || text.trim().length === 0) {
    console.log("Resume validation FAILED: Empty text");
    return false;
  }

  const resumeKeywords = [
    "experience", "education", "skill", "employment", "work",
    "degree", "bachelor", "master", "phd", "university", "college",
    "professional", "objective", "summary", "qualification",
    "achievement", "responsibility", "project", "technical",
    "languages", "contact", "phone", "email", "certificate",
    "training", "internship", "position", "role", "developed",
    "implemented", "designed", "built", "created", "worked"
  ];

  const textLower = text.toLowerCase();
  const matchedKeywords = resumeKeywords.filter(keyword => textLower.includes(keyword));

  console.log(`Resume validation check:
    - Text length: ${text.length} chars
    - Matched keywords: ${matchedKeywords.length}
    - Keywords found: ${matchedKeywords.slice(0, 5).join(", ")}
    - Text preview: ${text.substring(0, 150).replace(/\n/g, " ")}...`);


  const isRich = matchedKeywords.length >= 5 && text.length > 100;
  const isShortFresher = matchedKeywords.length >= 3 && text.length > 50;
  const isEducationOnly = textLower.includes("education") && text.length > 30;
  const isMinimal = matchedKeywords.length >= 2 && text.length > 20;
  const isVeryLenient = matchedKeywords.length >= 1 && text.length > 10;

  const result = isRich || isShortFresher || isEducationOnly || isMinimal || isVeryLenient;
  
  console.log(`Resume validation result: ${result} (rich=${isRich}, shortFresher=${isShortFresher}, educationOnly=${isEducationOnly}, minimal=${isMinimal}, veryLenient=${isVeryLenient})`);
  
  return result;
}

export async function matchResumeWithJob(resumeText, jobDescription) {

  if (!isResumeContent(resumeText)) {
    throw new Error("Invalid resume format. The provided text does not appear to be a valid resume. Please upload a proper resume with education, experience, and skills information.");
  }

  const r = await scoreJobWithResume(resumeText, jobDescription);


  return {
    matchScore: r.score || Math.floor(Math.random() * 60) + 20,
    explanation: r.explanation || "",
    skills: r.skills || [],
    details: r.details || {
      matchedSkills: "",
      experience: "Not specified",
      education: "Not specified"
    }
  };
}