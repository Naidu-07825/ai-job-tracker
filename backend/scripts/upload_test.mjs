import fs from 'fs/promises';
const url = process.env.UPLOAD_URL || 'http://localhost:5000/api/resume/upload';
const filePath = 'tests/sample_resume_fresher.txt';
async function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
(async ()=>{
  for(let attempt=1; attempt<=20; attempt++){
    try{
      const buf = await fs.readFile(filePath);
      const fd = new FormData();
      fd.append('resume', new Blob([buf]), 'sample_resume_fresher.txt');
      fd.append('email', 'fresher@example.com');
      console.log(`Posting to ${url} (attempt ${attempt})`);
      const res = await fetch(url, { method: 'POST', body: fd });
      const ct = res.headers.get('content-type') || '';
      let body;
      if (ct.includes('application/json')) body = await res.json();
      else body = await res.text();
      console.log('Status:', res.status);
      console.log('Response:', body);
      break;
    } catch (err){
      console.error('Upload attempt failed:', err.message);
      await wait(1000);
    }
  }
})();