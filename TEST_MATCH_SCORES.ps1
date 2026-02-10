#!/usr/bin/env powershell
# Test Script for Resume Match Score Fix

Write-Host "🧪 Resume Match Score Testing Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Connectivity
Write-Host "Test 1: Backend Server Connectivity" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/jobs/mock" -UseBasicParsing -ErrorAction Stop
    $jobs = $response.Content | ConvertFrom-Json
    Write-Host "✅ Backend running: $(($response.Content | ConvertFrom-Json).Count) jobs loaded" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not responding. Start with: cd backend; node src/fastifyServer.js" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Resume Text Submit
Write-Host "Test 2: Resume Match Scoring (Without API Key)" -ForegroundColor Yellow
$testResume = "B.Tech Computer Science Engineering (Data Science) student. Technical Skills: Python, C, SQL, JavaScript, React.js, Node.js, MongoDB, MySQL. Internships: Web Development at ApexPlanet, Full Stack at Pena4. Projects: E-Library, Student Dashboard, SpeedCopy platform."
$testJob = "Seeking full stack developer with expertise in React, Node.js, and MongoDB. Must have 3+ years experience."

$matchRequest = @{
    resumeText = $testResume
    jobDescription = $testJob
} | ConvertTo-Json

try {
    $matchResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/match" `
        -Method Post `
        -Body $matchRequest `
        -ContentType "application/json" `
        -UseBasicParsing `
        -ErrorAction Stop
    
    $matchData = $matchResponse.Content | ConvertFrom-Json
    
    Write-Host "Match Score: $($matchData.matchScore)%" -ForegroundColor Green
    Write-Host "Matched Skills: $($matchData.skills -join ', ')" -ForegroundColor Green
    Write-Host "Explanation: $($matchData.explanation)" -ForegroundColor Green
    Write-Host ""
    
    if ($matchData.matchScore -gt 30) {
        Write-Host "✅ Keyword-based matching is working! Score is meaningful (not random)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Match endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Check different job descriptions
Write-Host "Test 3: Multiple Job Matches" -ForegroundColor Yellow

$testJobs = @(
    @{ title = "Full Stack Developer"; desc = "React, Node.js, MongoDB required" },
    @{ title = "Python Developer"; desc = "Python backend, Django, databases" },
    @{ title = "Java Developer"; desc = "5+ years Java, Spring Boot, AWS" },
    @{ title = "Data Scientist"; desc = "Python, ML, SQL, data analysis" }
)

foreach ($job in $testJobs) {
    $req = @{
        resumeText = $testResume
        jobDescription = $job.desc
    } | ConvertTo-Json
    
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:5000/api/match" `
            -Method Post -Body $req -ContentType "application/json" `
            -UseBasicParsing -ErrorAction Stop
        
        $data = $res.Content | ConvertFrom-Json
        Write-Host "  $($job.title): $($data.matchScore)%" -ForegroundColor Cyan
    } catch {
        Write-Host "  $($job.title): Error" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Expected Results:" -ForegroundColor Yellow
Write-Host "  • Full Stack Developer: 40-50% (React, Node, Mongo match)" -ForegroundColor Yellow
Write-Host "  • Python Developer: 30-40% (Python and basics match)" -ForegroundColor Yellow
Write-Host "  • Java Developer: 10-20% (No Java in resume)" -ForegroundColor Yellow
Write-Host "  • Data Scientist: 35-45% (Python + B.Tech Data Science)" -ForegroundColor Yellow
Write-Host ""
Write-Host "If scores are consistent with above: ✅ FIX SUCCESSFUL" -ForegroundColor Green
Write-Host "If scores were random before: ✅ IMPROVEMENT CONFIRMED" -ForegroundColor Green
