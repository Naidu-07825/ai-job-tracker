import fs from 'fs/promises';
import path from 'path';
import { isResumeContent } from '../src/services/matchService.js';
const samplePath = path.resolve('tests/sample_resume_fresher.txt');
(async ()=>{
  try{
    const text = await fs.readFile(samplePath,'utf8');
    console.log('Sample length:', text.length);
    console.log('Sample text:\n', text);
    console.log('isResumeContent ->', isResumeContent(text));
  }catch(err){
    console.error('Error:', err.message);
  }
})();