import store from "../data/store.js";
import { sendOfferEmail } from "../services/emailService.js";


const emailEventLog = {};

export default async function (app) {
  app.post("/api/apply", async (request, reply) => {
    try {
      const { userEmail = "test@gmail.com", job } = request.body || {};
      if (!job || !job.id) return reply.status(400).send({ error: "Missing job" });

      const application = {
        id: `${job.id}-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        appliedAt: new Date().toISOString(),
        status: "Applied",
        history: [{ status: "Applied", at: new Date().toISOString() }],
      };

      await store.addApplication(userEmail, application);
      return { success: true, application };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: "Failed to save application", message: err.message });
    }
  });

  app.get("/api/applications", async (request, reply) => {
    try {
      const user = request.query.user || "test@gmail.com";
      const apps = store.getApplications(user);
      return { applications: apps || [] };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: "Failed to retrieve applications" });
    }
  });


  app.post("/api/applications/:user/:appId/status", async (request, reply) => {
    try {
      const { user, appId } = request.params;
      const { status, jobTitle, company, salary, location } = request.body || {};
      
      if (!status) {
        return reply.status(400).send({ error: "Missing status field in request body" });
      }

      const apps = store.getApplications(user) || [];
     
      let a = apps.find((x) => x.id === appId || x.jobId === appId);
      
      
      if (!a) {
        if (!jobTitle || !company) {
          return reply.status(400).send({ error: "Job details required to create application" });
        }
        
        
        const newApplication = {
          id: `${appId}-${Date.now()}`,
          jobId: appId,
          jobTitle: jobTitle,
          company: company,
          salary: salary || "Competitive",
          appliedAt: new Date().toISOString(),
          status: status,
          history: [{ status: status, at: new Date().toISOString() }],
        };
        
        apps.push(newApplication);
        await store.saveAll();
        a = newApplication;
        console.log(`📝 Created application for ${user} on job ${appId}`);
      } else {
        
        a.status = status;
        a.history = a.history || [];
        a.history.push({ status, at: new Date().toISOString() });
        await store.saveAll();
      }
      
     
      const emailEventKey = `${user}-${a.id}`;
      
      if (status === "OFFER") {
        
        if (!emailEventLog[emailEventKey]) {
          try {
            
            const userName = request.headers["x-user-name"] || user.split("@")[0] || "User";
            const userEmail = user;
            const finalJobTitle = a.jobTitle || jobTitle || "Position";
            const finalCompany = a.company || company || "Our Company";
            const finalSalary = a.salary || salary || "Competitive";
            const finalLocation = location || "Not specified";

            
            const emailSent = await sendOfferEmail(userEmail, userName, finalJobTitle, finalCompany, finalSalary, finalLocation);
            
            if (emailSent) {
             
              emailEventLog[emailEventKey] = {
                status: "SENT",
                sentAt: new Date().toISOString(),
                jobId: a.jobId,
                applicationId: a.id
              };
              
            
              a.emailSent = {
                status: "OFFER",
                sentAt: new Date().toISOString(),
                sentTo: userEmail
              };
              
              await store.saveAll();
              
              console.log(`Offer email sent successfully to ${userEmail} for ${finalJobTitle} at ${finalCompany}`);
            }
          } catch (emailError) {
            console.error("Error sending offer email:", emailError.message);
           
          }
        } else {
          console.log(`Offer email already sent for ${emailEventKey}. Skipping duplicate.`);
        }
      }
      
      return { 
        success: true, 
        application: a,
        message: status === "OFFER" ? "Application marked as OFFER. Congratulation email sent!" : `Status updated to ${status}`
      };
    } catch (err) {
      app.log.error({ error: err, message: err.message }, "Status update error");
      return reply.status(500).send({ error: "Failed to update application status", message: err.message });
    }
  });

  
  app.get("/api/applications/email-logs/:user", async (request, reply) => {
    try {
      const { user } = request.params;
      return { emailLogs: emailEventLog || {} };
    } catch (err) {
      app.log.error(err);
      return reply.status(500).send({ error: "Failed to retrieve email logs" });
    }
  });
}
