import { OpenAI } from "@langchain/openai";

const llm = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, temperature: 0 })
  : null;


function scoreWithKeywords(resumeText, jobDescription) {
  const resume = resumeText.toLowerCase();
  const job = jobDescription.toLowerCase();


  const skillKeywords = {
    python: ["python", "py"],
    javascript: ["javascript", "js", "nodejs", "node.js"],
    react: ["react", "react.js"],
    nodejs: ["node.js", "nodejs", "node"],
    express: ["express.js", "express"],
    mongodb: ["mongodb", "mongo", "db", "database"],
    mysql: ["mysql", "sql"],
    typescript: ["typescript", "ts"],
    java: ["java"],
    cpp: ["c++", "cpp"],
    html: ["html", "html5"],
    css: ["css", "css3"],
    git: ["git", "github"],
    docker: ["docker"],
    aws: ["aws", "amazon"],
    rest: ["rest", "api", "restful"],
    testing: ["testing", "jest", "mocha", "unit test"],
    agile: ["agile", "scrum"],
  };

  let matchedSkills = [];
  let skillScore = 0;

  
  Object.entries(skillKeywords).forEach(([skill, keywords]) => {
    const presentInJob = keywords.some(kw => job.includes(kw));
    const presentInResume = keywords.some(kw => resume.includes(kw));
    
    if (presentInJob && presentInResume) {
      matchedSkills.push(skill);
      skillScore += 10;
    }
  });

  
  let educationBonus = 0;
  let hasEducation = false;
  if ((resume.includes("b.tech") || resume.includes("bachelor") || resume.includes("computer science")) &&
      (job.includes("degree") || job.includes("bachelor") || job.includes("b.tech"))) {
    educationBonus = 10;
    hasEducation = true;
  }


  let experienceBonus = 0;
  let experienceMatch = null;
  
  const resumeExpMatch = resume.match(/(\d+)\s*(?:\+|-\d+)?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp|professional)?/i);
  const jobExpMatch = job.match(/(\d+)\s*(?:\+|-\d+)?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)?/i);
  
  if (resumeExpMatch && jobExpMatch) {
    const resumeExp = parseInt(resumeExpMatch[1]);
    const jobExp = parseInt(jobExpMatch[1]);
    if (resumeExp >= jobExp - 1) {
      experienceBonus = 15;
      experienceMatch = `${resumeExp} years of experience (matches or exceeds ${jobExp} required)`;
    } else if (resumeExp >= Math.max(0, jobExp - 3)) {
      experienceBonus = 8;
      experienceMatch = `${resumeExp} years of experience (slightly below ${jobExp} required)`;
    }
  } else if (resumeExpMatch && !jobExpMatch) {

    const resumeExp = parseInt(resumeExpMatch[1]);
    experienceBonus = 5;
    experienceMatch = `${resumeExp} years of professional experience`;
  } else if (resume.includes("internship") || resume.includes("project")) {
    experienceBonus = 5;
    experienceMatch = "Relevant project or internship experience";
  }

  
  let roleBonus = 0;
  const jobTitles = ["developer", "engineer", "analyst", "manager", "designer", "lead"];
  jobTitles.forEach(title => {
    if (job.includes(title) && resume.includes(title)) {
      roleBonus = 10;
    }
  });

  
  let finalScore = Math.min(100, skillScore + educationBonus + experienceBonus + roleBonus);
  
 
  if (matchedSkills.length > 0 && finalScore < 30) {
    finalScore = 30 + (matchedSkills.length * 5);
  }

  let explanationParts = [];
  if (matchedSkills.length > 0) {
    explanationParts.push(`Skills: ${matchedSkills.slice(0, 5).join(", ")}`);
  }
  if (experienceMatch) {
    explanationParts.push(`Experience: ${experienceMatch}`);
  }
  if (hasEducation) {
    explanationParts.push("Education: Relevant degree found");
  }
  
  const explanation = explanationParts.length > 0 
    ? explanationParts.join(" • ")
    : "Limited overlap with job requirements";

  return {
    score: Math.max(0, Math.min(100, finalScore)),
    skills: matchedSkills.slice(0, 5),
    explanation,
    details: {
      matchedSkills: matchedSkills.slice(0, 5),
      experience: experienceMatch || "Not specified in resume",
      education: hasEducation ? "Relevant degree found" : "No matching education found"
    }
  };
}

export async function scoreJobWithResume(resumeText, jobDescription) {

  if (!llm) {
    return scoreWithKeywords(resumeText, jobDescription);
  }

  const prompt = `You are an expert recruiter. Analyze this resume against the job description and provide a JSON response ONLY (no other text).

The JSON must have this exact structure:
{
  "score": <0-100 integer>,
  "skills": [<array of 3-5 matched skill strings>],
  "matchedSkills": "<comma-separated string of skills>",
  "experience": "<brief description of relevant experience>",
  "education": "<relevant education from resume>",
  "explanation": "<one sentence summary>"
}

Resume:
${resumeText}

Job Description:
${jobDescription}`;

  try {
    const resp = await llm.generate([prompt]);
    const out = resp?.generations?.[0]?.[0]?.text || "";

    try {
      
      let jsonText = out.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }
      
      const json = JSON.parse(jsonText);
      return { 
        score: Number(json.score || 0), 
        skills: json.skills || json.matchedSkills?.split(",").map(s => s.trim()) || [], 
        explanation: json.explanation || "",
        details: {
          matchedSkills: json.matchedSkills || "",
          experience: json.experience || "Not specified",
          education: json.education || "Not specified"
        }
      };
    } catch (err) {
   
      const m = out.match(/(\d{1,3})/);
      const score = m ? Number(m[1]) : scoreWithKeywords(resumeText, jobDescription).score;
      const fallback = scoreWithKeywords(resumeText, jobDescription);
      return { 
        score, 
        skills: fallback.skills, 
        explanation: out.substring(0, 200),
        details: fallback.details
      };
    }
  } catch (err) {
  
    console.error("LLM scoring failed, using keyword fallback:", err.message);
    return scoreWithKeywords(resumeText, jobDescription);
  }
}
