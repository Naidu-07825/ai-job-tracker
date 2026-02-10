import axios from "axios";

const MOCK_JOBS = [

  { id: "job-1", title: "Frontend Developer (React)", company: "TCS", location: "Bangalore, India", description: "Build responsive web applications using React. 3+ years experience required.", applyUrl: "https://example.com/apply/1", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Software" },
  { id: "job-2", title: "React Native Developer", company: "Infosys", location: "Hyderabad, India", description: "Develop mobile apps using React Native. Work with cross-platform development.", applyUrl: "https://example.com/apply/2", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Software" },
  { id: "job-3", title: "Angular Developer", company: "Accenture", location: "Mumbai, India", description: "Create dynamic web applications using Angular framework. 2-5 years required.", applyUrl: "https://example.com/apply/3", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 259200000).toISOString(), industry: "Software" },
  { id: "job-4", title: "Vue.js Developer", company: "Wipro", location: "Delhi, India", description: "Build modern UIs with Vue.js. Experience with JavaScript ES6+ required.", applyUrl: "https://example.com/apply/4", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 43200000).toISOString(), industry: "Software" },
  { id: "job-5", title: "Frontend Engineer", company: "Cognizant", location: "Pune, India", description: "Work on cutting-edge web technologies. HTML, CSS, JavaScript expertise needed.", applyUrl: "https://example.com/apply/5", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Software" },
  

  { id: "job-6", title: "Backend Developer (Node.js)", company: "MindTree", location: "Bangalore, India", description: "Develop scalable APIs using Node.js and Express. Database design experience needed.", applyUrl: "https://example.com/apply/6", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Software" },
  { id: "job-7", title: "Python Backend Developer", company: "HCL Technologies", location: "Noida, India", description: "Build Python-based microservices. Django/Flask experience required.", applyUrl: "https://example.com/apply/7", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 259200000).toISOString(), industry: "Software" },
  { id: "job-8", title: "Java Developer", company: "Tech Mahindra", location: "Chennai, India", description: "Develop enterprise applications in Java. Spring Boot knowledge preferred.", applyUrl: "https://example.com/apply/8", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Software" },
  { id: "job-9", title: "Go Developer", company: "IBM India", location: "Bangalore, India", description: "Build concurrent systems in Go. Experience with concurrency patterns needed.", applyUrl: "https://example.com/apply/9", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 43200000).toISOString(), industry: "Software" },
  { id: "job-10", title: ".NET Developer", company: "Capgemini", location: "Gurgaon, India", description: "Develop applications using C# and .NET framework. SQL Server knowledge required.", applyUrl: "https://example.com/apply/10", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Software" },


  { id: "job-11", title: "Full Stack Developer", company: "Persistent Systems", location: "Pune, India", description: "Develop end-to-end web applications. Frontend and backend expertise needed.", applyUrl: "https://example.com/apply/11", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 259200000).toISOString(), industry: "Software" },
  { id: "job-12", title: "MEAN Stack Developer", company: "Virtusa", location: "Bangalore, India", description: "Build web apps with MongoDB, Express, Angular, Node. 3+ years required.", applyUrl: "https://example.com/apply/12", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Software" },
  { id: "job-13", title: "MERN Stack Engineer", company: "Newgen Software", location: "Hyderabad, India", description: "Develop with MongoDB, Express, React, Node. Database optimization skills needed.", applyUrl: "https://example.com/apply/13", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 43200000).toISOString(), industry: "Software" },
  { id: "job-14", title: "PHP Developer", company: "Hexaware", location: "Mumbai, India", description: "Build web applications using PHP and Laravel. MySQL experience required.", applyUrl: "https://example.com/apply/14", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Software" },


  { id: "job-15", title: "DevOps Engineer", company: "CloudGate", location: "Bangalore, India", description: "Manage cloud infrastructure and CI/CD pipelines. AWS experience required.", applyUrl: "https://example.com/apply/15", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 259200000).toISOString(), industry: "Software" },
  { id: "job-16", title: "Cloud Architect", company: "NetApp India", location: "Pune, India", description: "Design scalable cloud solutions. Azure and AWS expertise needed.", applyUrl: "https://example.com/apply/16", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Software" },
  { id: "job-17", title: "Kubernetes Specialist", company: "Red Hat", location: "Gurgaon, India", description: "Manage Kubernetes clusters and containerization. Docker knowledge required.", applyUrl: "https://example.com/apply/17", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 43200000).toISOString(), industry: "Software" },


  { id: "job-18", title: "Data Scientist", company: "Fractal Analytics", location: "Bangalore, India", description: "Build ML models and analyze data. Python, TensorFlow, scikit-learn needed.", applyUrl: "https://example.com/apply/18", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Software" },
  { id: "job-19", title: "Machine Learning Engineer", company: "Analytics Vidhya", location: "Noida, India", description: "Develop ML solutions and predictive models. Deep learning experience preferred.", applyUrl: "https://example.com/apply/19", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 259200000).toISOString(), industry: "Software" },
  { id: "job-20", title: "Data Engineer", company: "Informatica", location: "Hyderabad, India", description: "Design data pipelines and ETL processes. Spark and Hadoop knowledge needed.", applyUrl: "https://example.com/apply/20", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Software" },
  { id: "job-21", title: "AI/ML Researcher", company: "Microsoft India", location: "Bangalore, India", description: "Research and develop AI algorithms. Deep learning and NLP expertise required.", applyUrl: "https://example.com/apply/21", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 43200000).toISOString(), industry: "Software" },


  { id: "job-22", title: "QA Automation Engineer", company: "Mindtree", location: "Pune, India", description: "Automate test cases using Selenium. Java or Python required.", applyUrl: "https://example.com/apply/22", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Software" },
  { id: "job-23", title: "Manual QA Tester", company: "Syntel", location: "Chennai, India", description: "Test applications and report bugs. Detailed attention required.", applyUrl: "https://example.com/apply/23", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 259200000).toISOString(), industry: "Software" },


  { id: "job-24", title: "Embedded Systems Engineer", company: "TCS Electronics", location: "Bangalore, India", description: "Develop firmware for embedded devices. C/C++ and microcontroller knowledge needed.", applyUrl: "https://example.com/apply/24", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Hardware" },
  { id: "job-25", title: "Hardware Design Engineer", company: "Intel India", location: "Bangalore, India", description: "Design hardware circuits and PCBs. Verilog/VHDL experience required.", applyUrl: "https://example.com/apply/25", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 43200000).toISOString(), industry: "Hardware" },
  { id: "job-26", title: "FPGA Developer", company: "Xilinx India", location: "Hyderabad, India", description: "Develop FPGA designs. Xilinx ISE and Vivado knowledge needed.", applyUrl: "https://example.com/apply/26", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Hardware" },
  { id: "job-27", title: "IoT Solutions Engineer", company: "Qualcomm India", location: "Bangalore, India", description: "Build IoT devices and embedded solutions. ARM and wireless protocols needed.", applyUrl: "https://example.com/apply/27", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 259200000).toISOString(), industry: "Hardware" },
  { id: "job-28", title: "PCB Design Engineer", company: "Flex Electronics", location: "Chennai, India", description: "Design printed circuit boards. EAGLE or Altium experience required.", applyUrl: "https://example.com/apply/28", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Hardware" },
  { id: "job-29", title: "Firmware Engineer", company: "Realtek Semiconductor", location: "Noida, India", description: "Develop firmware for networking devices. Unix/Linux knowledge required.", applyUrl: "https://example.com/apply/29", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 43200000).toISOString(), industry: "Hardware" },


  { id: "job-30", title: "Product Manager", company: "Flipkart", location: "Bangalore, India", description: "Lead product strategy and roadmap. MBA preferred, 3+ years experience.", applyUrl: "https://example.com/apply/30", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Business" },
  { id: "job-31", title: "Project Manager", company: "Maersk", location: "Gurgaon, India", description: "Manage IT projects and teams. PMP certification preferred.", applyUrl: "https://example.com/apply/31", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 259200000).toISOString(), industry: "Business" },
  { id: "job-32", title: "Business Analyst", company: "Goldman Sachs", location: "Mumbai, India", description: "Analyze business requirements and propose solutions. SQL knowledge needed.", applyUrl: "https://example.com/apply/32", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Business" },
  { id: "job-33", title: "Sales Executive", company: "Salesforce", location: "Delhi, India", description: "Manage client relationships and close deals. Target-driven approach required.", applyUrl: "https://example.com/apply/33", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 43200000).toISOString(), industry: "Business" },
  { id: "job-34", title: "Marketing Manager", company: "Adobe", location: "Bangalore, India", description: "Lead marketing campaigns and initiatives. Digital marketing experience needed.", applyUrl: "https://example.com/apply/34", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Business" },
  { id: "job-35", title: "HR Manager", company: "Johnson & Johnson", location: "Mumbai, India", description: "Manage HR operations and recruitment. SHRM certification preferred.", applyUrl: "https://example.com/apply/35", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 259200000).toISOString(), industry: "Business" },
  { id: "job-36", title: "Financial Analyst", company: "Deloitte", location: "Hyderabad, India", description: "Analyze financial data and prepare reports. CFA preferred, 2+ years needed.", applyUrl: "https://example.com/apply/36", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Business" },
  { id: "job-37", title: "Operations Manager", company: "Amazon", location: "Bangalore, India", description: "Optimize operational efficiency. Supply chain experience helpful.", applyUrl: "https://example.com/apply/37", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 43200000).toISOString(), industry: "Business" },


  { id: "job-38", title: "Senior Software Engineer", company: "Google India", location: "Bangalore, India", description: "Lead technical initiatives. 5+ years experience in core CS fundamentals.", applyUrl: "https://example.com/apply/38", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Software" },
  { id: "job-39", title: "Solutions Architect", company: "Oracle India", location: "Pune, India", description: "Design enterprise solutions. System design and scalability experience required.", applyUrl: "https://example.com/apply/39", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 259200000).toISOString(), industry: "Software" },
  { id: "job-40", title: "Security Engineer", company: "Cisco", location: "Bangalore, India", description: "Secure systems and networks. Cryptography and penetration testing knowledge.", applyUrl: "https://example.com/apply/40", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Software" },
  { id: "job-41", title: "Database Administrator", company: "SAP Labs", location: "Bangalore, India", description: "Manage and optimize databases. Oracle/PostgreSQL experience needed.", applyUrl: "https://example.com/apply/41", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 43200000).toISOString(), industry: "Software" },
  { id: "job-42", title: "API Developer", company: "Stripe", location: "Bangalore, India", description: "Build RESTful APIs and integrations. Microservices architecture knowledge.", applyUrl: "https://example.com/apply/42", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Software" },
  { id: "job-43", title: "Mobile App Developer", company: "Uber", location: "Bangalore, India", description: "Develop iOS/Android apps. Swift or Kotlin experience required.", applyUrl: "https://example.com/apply/43", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 259200000).toISOString(), industry: "Software" },
  { id: "job-44", title: "Web Performance Engineer", company: "Netflix", location: "Bangalore, India", description: "Optimize web performance. CDN and caching strategies knowledge needed.", applyUrl: "https://example.com/apply/44", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Software" },
  { id: "job-45", title: "Blockchain Developer", company: "ConsenSys", location: "Mumbai, India", description: "Develop blockchain applications. Solidity and Web3 knowledge required.", applyUrl: "https://example.com/apply/45", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 43200000).toISOString(), industry: "Software" },


  { id: "job-46", title: "Power Electronics Engineer", company: "Siemens India", location: "Pune, India", description: "Design power systems. Knowledge of AC/DC converters required.", applyUrl: "https://example.com/apply/46", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Hardware" },
  { id: "job-47", title: "Automotive Electronics Engineer", company: "Bosch", location: "Bangalore, India", description: "Develop automotive electronics. CAN bus and AUTOSAR knowledge needed.", applyUrl: "https://example.com/apply/47", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 259200000).toISOString(), industry: "Hardware" },
  { id: "job-48", title: "Telecommunications Engineer", company: "Ericsson", location: "Hyderabad, India", description: "Develop telecom solutions. 4G/5G and signal processing knowledge.", applyUrl: "https://example.com/apply/48", jobType: "Full-time", workMode: "On-site", postedAt: new Date(Date.now() - 86400000).toISOString(), industry: "Hardware" },


  { id: "job-49", title: "Consultant", company: "McKinsey", location: "Delhi, India", description: "Provide strategic consulting. MBA preferred, analytical skills needed.", applyUrl: "https://example.com/apply/49", jobType: "Full-time", workMode: "Hybrid", postedAt: new Date(Date.now() - 43200000).toISOString(), industry: "Business" },
  { id: "job-50", title: "Supply Chain Specialist", company: "Walmart", location: "Bangalore, India", description: "Optimize supply chain operations. SAP knowledge preferred.", applyUrl: "https://example.com/apply/50", jobType: "Full-time", workMode: "Remote", postedAt: new Date(Date.now() - 172800000).toISOString(), industry: "Business" },
];


function transformAdzunaJob(job) {
  return {
    id: job.id,
    title: job.title,
    company: job.company?.display_name || "Unknown Company",
    location: job.location?.display_name || "Unknown Location",
    description: job.description || "",
    applyUrl: job.redirect_url,
    jobType: job.contract_time || "Full-time",
    salary: job.salary_min && job.salary_max 
      ? `${job.salary_min} - ${job.salary_max}` 
      : job.salary_is_predicted ? "Estimated: Contact for details" : null,
    postedAt: job.created,
    source: "adzuna",
  };
}


function filterMockJobs(jobs, filters = {}) {
  let filtered = [...jobs];


  if (filters.query) {
    const q = filters.query.toLowerCase();
    filtered = filtered.filter(job =>
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q)
    );
  }


  if (filters.location) {
    const loc = filters.location.toLowerCase();
    filtered = filtered.filter(job =>
      job.location.toLowerCase().includes(loc)
    );
  }


  if (filters.jobType) {
    filtered = filtered.filter(job =>
      job.jobType.toLowerCase() === filters.jobType.toLowerCase()
    );
  }

 
  if (filters.daysPosted) {
    const cutoffDate = new Date(Date.now() - filters.daysPosted * 86400000);
    filtered = filtered.filter(job =>
      new Date(job.postedAt) >= cutoffDate
    );
  }

  return filtered;
}

/**
 * Fetch jobs from Adzuna API
 * Falls back to mock data if API credentials missing or request fails
 * 
 * @param {string} query - Search query (e.g., "frontend developer")
 * @param {object} filters - Filter options { location, jobType, daysPosted }
 * @param {boolean} useMock - Force mock data for testing
 * @returns {Promise<Array>} Array of normalized job objects
 */
export async function fetchJobs(query = "", filters = {}, useMock = false) {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;


  if (useMock || !appId || !appKey) {
    console.log("Using mock jobs (API credentials not configured)");
    return filterMockJobs(MOCK_JOBS, { query, ...filters });
  }

  try {
    console.log(`Fetching jobs from Adzuna API for: "${query}"`);

    const params = {
      app_id: appId,
      app_key: appKey,
      what: query || "developer",
      results_per_page: 50,
      sort_by: "date",
    };

  
    if (filters.location) {
      params.where = filters.location;
    }

    
    if (filters.jobType) {
      params.contract_time = filters.jobType;
    }

    const response = await axios.get(
      "https://api.adzuna.com/v1/api/jobs/gb/search/1",
      { params, timeout: 10000 }
    );

    if (!response.data?.results) {
      console.warn("No results from Adzuna API, falling back to mock data");
      return filterMockJobs(MOCK_JOBS, { query, ...filters });
    }

    const jobs = response.data.results.map(transformAdzunaJob);
    
    console.log(`Successfully fetched ${jobs.length} jobs from Adzuna`);
    return jobs;

  } catch (error) {
    console.error("Adzuna API error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });

    
    console.log("Falling back to mock data due to API error");
    return filterMockJobs(MOCK_JOBS, { query, ...filters });
  }
}


export function getMockJobs(filters = {}) {
  return filterMockJobs(MOCK_JOBS, filters);
}