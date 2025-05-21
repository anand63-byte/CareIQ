require('dotenv').config(); // Load environment variables
const express = require('express');
const app = express();

const Tesseract = require('tesseract.js');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');
const reportModel = require('./models/reportModel');
const bodyParser = require('body-parser');
const userModel = require('./models/userModel');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const pdfParse = require('pdf-parse'); // Import pdf-parse for PDF text extraction

const drModel = require('./models/drModel'); // Import the doctor model

const JWT_SECRET = process.env.JWT_SECRET; // Use JWT secret from .env

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY }); // Use API key from .env

const _dirname = path.resolve(); 

let imagePath = "test1.png"; 
const outputPath = "output.txt";

const tempDir = path.join(__dirname, 'temp'); // Define the temp directory path
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true }); // Create the temp directory if it doesn't exist
}

app.use(bodyParser.json()); // Parse JSON request bodies
app.use(cookieParser());    // Parse cookies

// Configure Multer to use memory storage (files remain in memory and not saved to disk)
const upload = multer({ storage: multer.memoryStorage() });

// app.get('/', (req, res) => {
//   res.redirect('/sign-in'); 
// });

app.get('/getInfo', async (req, res) => {
  try {
    const token = req.cookies.authToken; // Get the token from cookies
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
    const user = await userModel.findById(decoded.id); // Find the logged-in user
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Process a pre-defined image file using Tesseract
    Tesseract.recognize(imagePath, 'eng', {
      logger: () => {} // Disable logging to the terminal
    }).then(async ({ data: { text } }) => {
      const report = await reportModel.create({ text }); // Create a new report
      user.reports.push(report._id); // Add the report ID to the user's reports field
      await user.save(); // Save the updated user document

      res.send({ message: 'Text extraction completed and report added to user', reportId: report._id });
    }).catch(err => {
      res.status(500).send({ message: 'Error processing the image', error: err });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error in /getInfo route', error });
  }
});

// 3 attempt
app.get('/api/genAI', async (req, res) => {
  try {
    const token = req.cookies.authToken;

    if (!token) {
      console.warn('No token provided in cookies.');
      return res.status(401).send({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user) {
      console.warn('User not found for ID:', decoded.id);
      return res.status(404).send({ message: 'User not found' });
    }

    const reports = await reportModel.find({ _id: { $in: user.reports } });

    const fileData = reports.map(r => r.text).join(' ');

    if (!fileData) {
      console.warn('No report text available for analysis.');
      return res.status(400).send({ message: 'No report text available for analysis' });
    }

    // Prepare the prompt once
    const prompt = `You are a medical data analyst. Below is a detailed medical report containing lab results, diagnostic imaging findings, and clinical notes.
Please do the following:
  1. Summarize the key findings in clear bullet points.
  2. Identify any abnormal results or trends that indicate the patient's condition is either improving or worsening.
  3. Highlight any critical points that need immediate attention.
  4. Recommend potential follow-up actions or tests, if applicable.
Note: Provide the data in JSON format & give all four points as arrays of text.
Report Text: ${fileData}`;

    // Retry loop
    let aiResponse = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        console.log(`genAI attempt ${attempt}...`);
        aiResponse = await genAI.models.generateContent({
          model: 'gemini-2.0-flash-001',
          contents: prompt,
        });

        // If we got valid text, break out
        if (aiResponse && aiResponse.text) {
          break;
        }
      } catch (err) {
        console.error(`Error on genAI attempt ${attempt}:`, err);
        // Continue to next attempt
      }
    }

    // After 5 attempts, if still no valid response
    if (!aiResponse || !aiResponse.text) {
      console.error('genAI did not respond after 5 attempts.');
      return res
        .status(502)
        .json({ error: 'genAI did not respond after multiple attempts. Please try again later.' });
    }

    res.json(aiResponse.text);
  } catch (error) {
    console.error('Error in /api/genAI route:', error);
    res.status(500).json({ error: 'Error generating content' });
  }
});

app.post('/api/signIn', async (req, res) => {
  let { username, email, password } = req.body;
  const user = await userModel.create({
    name: username,
    email: email,
    password: password,
  });

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);

  // #
  res.cookie('authToken', token, { httpOnly: true }); // Use 'token' for both users and doctors

  res.status(200).send({ message: 'Sign-in data received successfully' });
});

app.post('/api/logIn', async (req, res) => {
  let { email, password } = req.body;
  const user = await userModel.findOne({ email: email, password: password });
  if (!user) {
    return res.status(401).send({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);

  // #
  res.cookie('authToken', token, { httpOnly: true }); // Use 'token' for both users and doctors

  res.status(200).send({ message: 'Logged-in data received successfully' });
});

app.get('/api/logout', async (req, res) => {
  try {
    res.clearCookie('authToken'); // Clear the authentication token cookie
    res.status(200).send({ message: 'Logged out successfully', redirect: '/sign-in' });
  } catch (error) {
    console.error('Error in /api/logout route:', error);
    res.status(500).send({ message: 'Error logging out', error });
  }
});

app.get('/api/home', async (req, res) => {
  try {
    const token = req.cookies.authToken; // Use 'authToken' for users
    if (!token) {
      return res.status(200).send({ loggedIn: false, message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userModel
      .findById(decoded.id)
      .populate('reports')
      .populate('doctors');
    if (!user) {
      return res.status(200).send({ loggedIn: false, message: 'User not found' });
    }

    const reports = user.reports.map(report => ({
      ...report.toJSON(),
      photo: report.photo ? `data:image/png;base64,${report.photo.toString('base64')}` : null,
      fileData: report.fileData ? `data:application/pdf;base64,${report.fileData.toString('base64')}` : null
    }));

    res.status(200).send({
      loggedIn: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        reports,
        doctors: user.doctors,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ loggedIn: false, message: 'Error in /api/home route', error });
  }
});

app.post('/api/uploadReport', upload.single('report'), async (req, res) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    const mimeType = req.file.mimetype;

    if (mimeType === 'application/pdf') {
      const pdfBuffer = req.file.buffer;
      const pdfData = await pdfParse(pdfBuffer);

      const pdfDoc = await reportModel.create({
        fileName: req.file.originalname,
        fileData: pdfBuffer,
        text: pdfData.text,
      });

      user.reports.push(pdfDoc._id);
      await user.save();

      return res.status(200).send({
        message: 'PDF uploaded and processed successfully',
        reportId: pdfDoc._id,
      });
    } else if (mimeType.startsWith('image/')) {
      const photoBuffer = req.file.buffer;

      const { data: { text } } = await Tesseract.recognize(photoBuffer, 'eng', {
        logger: () => {}, // Disable logging
      });

      const report = await reportModel.create({
        text,
        photo: photoBuffer,
      });

      user.reports.push(report._id);
      await user.save();

      return res.status(200).send({
        message: 'Image uploaded and processed successfully',
        reportId: report._id,
      });
    } else {
      return res.status(400).send({ message: 'Unsupported file type. Only images and PDFs are allowed.' });
    }
  } catch (error) {
    console.error('Error in /api/uploadReport route:', error);
    res.status(500).send({ message: 'Error in /api/uploadReport route', error });
  }
});

app.post('/api/uploadPdf', upload.single('pdf'), async (req, res) => {
  try {
    // Get the token from cookies
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized: No token provided' });
    }

    // Verify token and decode user info
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Validate if a file is uploaded
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    // Validate file type (only allow PDFs)
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).send({ message: 'Invalid file type. Only PDFs are allowed.' });
    }

    const pdfBuffer = req.file.buffer;

    // Extract text from the PDF
    const pdfData = await pdfParse(pdfBuffer);

    // Create a new PDF document in the database
    const pdfDoc = await reportModel.create({
      fileName: req.file.originalname,
      fileData: pdfBuffer,
      text: pdfData.text,
    });

    user.reports.push(pdfDoc._id);
    await user.save();

    res.status(200).send({
      message: 'PDF uploaded and processed successfully',
      reportId: pdfDoc._id,
    });
  } catch (error) {
    console.error('Error in /api/uploadPdf route:', error);
    res.status(500).send({ message: 'Error in /api/uploadPdf route', error });
  }
});

// Report deletion ke liye hai
app.delete('/api/delete/:id', async (req, res) => {
  try {
    await reportModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Failed to delete report' });
  }
});

app.get('/api/removeDoc/:id', async (req, res) => {
  try {
    const token = req.cookies.authToken; // Get the token from cookies
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET); // Verify the token
    const user = await userModel.findById(decoded.id); // Find the logged-in user
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const doctorId = req.params.id; // Get the doctor ID from the request params
    const doctor = await drModel.findById(doctorId); // Find the doctor by ID
    if (!doctor) {
      return res.status(404).send({ message: 'Doctor not found' });
    }

    // Remove the doctor from the user's doctors list
    user.doctors = user.doctors.filter(docId => docId.toString() !== doctorId);
    await user.save();

    // Remove the user from the doctor's patients list
    doctor.patients = doctor.patients.filter(patientId => patientId.toString() !== user._id.toString());
    await doctor.save();

    res.status(200).send({ message: 'Doctor removed successfully' });
  } catch (error) {
    console.error('Error in /api/removeDoc route:', error);
    res.status(500).send({ message: 'Error removing doctor', error });
  }
});

app.get('/api/allDoctors', async (req, res) => {
  try {
    const doctors = await drModel.find();
    res.status(200).json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
})

app.post('/api/addDoc/:id', async (req, res) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await userModel.findById(decoded.id).populate('reports');
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const doctorId = req.params.id;
    const doctor = await drModel.findById(doctorId);
    if (!doctor) {
      return res.status(404).send({ message: 'Doctor not found' });
    }

    // Add doctor to user's doctors list if not already there
    if (!user.doctors.includes(doctorId)) {
      user.doctors.push(doctorId);
    }

    // Add user to doctor's patients list if not already there
    if (!doctor.patients.includes(user._id)) {
      doctor.patients.push(user._id);
    }

    await user.save();
    await doctor.save();

    res.status(200).send({
      message: 'Doctor added successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        reports: user.reports,
        doctors: user.doctors,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error in /api/addDoc route', error });
  }
});

app.post('/api/mediDecode', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    const imageBuffer = req.file.buffer;

    // Extract text from the image using Tesseract
    Tesseract.recognize(imageBuffer, 'eng', {
      logger: () => {}, // Disable logging
    }).then(async ({ data: { text } }) => {

      // Generate response using genAI
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: `You are a pharmaceutical information specialist.  
        Given the following extracted text from a medicine label, identify and return the information below in JSON format. If a field is not explicitly stated, infer the most likely value based on standard pharmaceutical knowledge; if truly unknowable, set its value to null.
 
        Note: 
        1. Do not completely rely on the extracted text , Identify the medicine name and search for the information on the internet.
        2. The information should be relveant to the Indian market.
        3. Give the data in easy words.

        Medicine Text:
        “${text}”

        Required Fields:
        1. **brand_name**: The marketed trade name of the medicine.  
        2. **generic_name**: The official generic (INN) name.  
        3. **salt_name**: The active pharmaceutical ingredient(s).  
        4. **dosage_form**: e.g. tablet, capsule, syrup, injection.  
        5. **strength**: e.g. “500 mg”, “250 mcg/mL”.  
        6. **recommended_dosage**: Typical adult and pediatric dosing guidelines.  
        7. **indications**: Approved clinical uses or conditions treated.  
        8. **contraindications**: Major situations or patient groups who should not take it.  
        9. **common_side_effects**: List of the most frequently reported adverse effects.  
        10. **storage_instructions**: Temperature, light, humidity requirements.  
        11. **manufacturer**: Name of the pharmaceutical company.  
        12. **approximate_price_range**: Typical retail cost for a standard pack or course (in local currency).  
        13. **cheapest_generic_options**: Any lower‐cost generic alternatives or equivalent INN brands.  
        14. **additional_notes**: Any extra relevant info (e.g. pregnancy category, drug interactions, patient tips).
        15. **food_suggestions**: Any food or drink for health benefits or to avoid while taking the medicine.`,
      });

      res.status(200).send({ analysis: response.text });
    }).catch((err) => {
      console.error('Tesseract error:', err);
      res.status(500).send({ message: 'Error processing the image', error: err });
    });
  } catch (error) {
    console.error('Error in /api/mediDecode route:', error);
    res.status(500).send({ message: 'Error in /api/mediDecode route', error });
  }
});

app.post('/api/prescriptionDecode', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }

    const imageBuffer = req.file.buffer;

    // Extract text from the image using Tesseract
    Tesseract.recognize(imageBuffer, 'eng', {
      logger: () => {}, // Disable logging
    }).then(async ({ data: { text } }) => {

      // Generate response using genAI
      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: `Please provide a concise summary of the following prescription text, listing only the prescribed medications with their strength, dosage, route, frequency, duration, and any patient instructions.

        Prescription Text:
        “${text}”`,
      });

      res.status(200).send({ analysis: response.text });
    }).catch((err) => {
      console.error('Tesseract error:', err);
      res.status(500).send({ message: 'Error processing the image', error: err });
    });
  } catch (error) {
    console.error('Error in /api/prescriptionDecode route:', error);
    res.status(500).send({ message: 'Error in /api/prescriptionDecode route', error });
  }
});

// Dr

app.post('/api/DrsignIn', async (req, res) => {
  let { username, email, password } = req.body;
  const user = await drModel.create({
    name: username,
    email: email,
    password: password,
  });

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
  res.cookie('token', token, { httpOnly: true }); // Use 'token' for both users and doctors
  res.status(200).send({ message: 'Sign-in data received successfully' });
})

app.post('/api/DrlogIn', async (req, res) => {
  try {
    let { email, password } = req.body;

    // Find the doctor by email and password
    const doctor = await drModel.findOne({ email: email, password: password });
    if (!doctor) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    // Generate a JWT token for the doctor
    const token = jwt.sign({ id: doctor._id, email: doctor.email }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true }); // Use 'token' for both users and doctors

    res.status(200).send({ message: 'Logged-in data received successfully' });
  } catch (error) {
    console.error('Error in /api/DrlogIn route:', error);
    res.status(500).send({ message: 'Error in /api/DrlogIn route', error });
  }
});

app.get('/api/DrHome', async (req, res) => {
  try {
    const token = req.cookies.token; // Use 'token' for both users and doctors

    if (!token) {
      console.warn('No token provided in cookies.');
      return res.status(401).send({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const doctor = await drModel.findById(decoded.id).populate('patients');
    if (!doctor) {
      console.warn('Doctor not found for ID:', decoded.id);
      return res.status(404).send({ message: 'Doctor not found' });
    }

    const patients = doctor.patients.map(patient => ({
      id: patient._id,
      name: patient.name,
      email: patient.email,
      reports: patient.reports,
    }));

    res.status(200).send({
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        patients,
      }
    });
  } catch (error) {
    console.error('Error in /api/DrHome route:', error); // Log the error
    res.status(500).send({ message: 'Error in /api/DrHome route', error });
  }
})

app.delete('/api/removePatient/:id', async (req, res) => {
  try {
    const token = req.cookies.token; // Use 'token' for both users and doctors
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const doctor = await drModel.findById(decoded.id);
    if (!doctor) {
      return res.status(404).send({ message: 'Doctor not found' });
    }

    const patientId = req.params.id;
    const patientIndex = doctor.patients.indexOf(patientId);
    if (patientIndex === -1) {
      return res.status(404).send({ message: 'Patient not found' });
    }

    doctor.patients.splice(patientIndex, 1); // Remove the patient from the doctor's list
    await doctor.save(); // Save the updated doctor document

    res.status(200).send({ message: 'Patient removed successfully' });
  } catch (error) {
    console.error('Error removing patient:', error);
    res.status(500).send({ message: 'Error removing patient', error });
  }
})

app.get('/api/reports/:id', async (req, res) => {
  try {
    const patientId = req.params.id; // Access the patient ID from the params
    const patient = await userModel.findById(patientId).populate('reports'); // Fetch the patient and populate reports

    if (!patient) {
      return res.status(404).send({ message: 'Patient not found' });
    }

    // Convert photo and fileData buffers to Base64 strings for each report
    const reports = patient.reports.map((report) => {
      const obj = report.toObject(); // Ensure buffers aren’t stripped
      return {
        ...obj,
        photo: obj.photo ? obj.photo.toString('base64') : null,
        fileData: obj.fileData ? obj.fileData.toString('base64') : null, // Ensure fileData is properly encoded
      };
    });

    res.status(200).send({
      message: 'Reports fetched successfully',
      reports,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).send({ message: 'Error fetching reports', error });
  }
});

// 5 attempt
app.get('/api/reportAnalysis/:id', async (req, res) => {
  try {

    const token = req.cookies.token;

    if (!token) {
      console.warn('No token provided in cookies.');
      return res.status(401).send({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const patientId = req.params.id;

    const patient = await userModel.findById(patientId).populate('reports');
    if (!patient) {
      console.warn('Patient not found for ID:', patientId);
      return res.status(404).send({ message: 'Patient not found' });
    }

    const reportText = patient.reports.map(r => r.text).join(' ');

    if (!reportText) {
      console.warn('No report text available for analysis.');
      return res.status(400).send({ message: 'No report text available for analysis' });
    }

    const prompt = `You are a medical data analyst. Below is a detailed medical report containing lab results, diagnostic imaging findings, and clinical notes.
Please do the following:
  1. Summarize the key findings in clear bullet points.
  2. Identify any abnormal results or trends that indicate the patient's condition is either improving or worsening.
  3. Highlight any critical points that need immediate attention.
  4. Recommend potential follow-up actions or tests, if applicable.
Note: Provide the data in JSON format & give all four points as arrays of text.
Report Text: ${reportText}`;

    let aiResponse = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        console.log(`genAI attempt ${attempt}...`);
        aiResponse = await genAI.models.generateContent({
          model: 'gemini-2.0-flash-001',
          contents: prompt,
        });

        if (aiResponse && aiResponse.text) {
          break;
        }
      } catch (err) {
        console.error(`Error on genAI attempt ${attempt}:`, err);
        // continue to next attempt
      }
    }

    if (!aiResponse || !aiResponse.text) {
      console.error('genAI did not respond after 5 attempts.');
      return res
        .status(502)
        .send({ message: 'genAI did not respond after multiple attempts. Please try again later.' });
    }

    // Clean and parse the JSON
    const cleaned = cleanJSON(aiResponse.text);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Error parsing genAI response:', parseError);
      return res.status(500).send({ message: 'Error parsing genAI response', error: parseError });
    }

    res.status(200).send({
      message: 'Report analysis generated successfully',
      reportAnalysis: parsed,
    });
    console.log('Response sent successfully.');

  } catch (error) {
    console.error('Error in /api/reportAnalysis/:id route:', error);
    res.status(500).send({ message: 'Error generating report analysis', error });
  }
});



// Helper function to clean Markdown formatting from a JSON string
function cleanJSON(rawString) {
  let cleanString = rawString.trim();

  // Remove leading code fence
  if (cleanString.startsWith("```")) {
    const firstNewline = cleanString.indexOf("\n");
    if (firstNewline !== -1) {
      cleanString = cleanString.substring(firstNewline + 1);
    }
  }

  // Remove trailing code fence
  if (cleanString.endsWith("```")) {
    const fenceIndex = cleanString.lastIndexOf("```");
    cleanString = cleanString.substring(0, fenceIndex).trim();
  }

  return cleanString;
}

// Serve static files from the frontend build directory
app.use(express.static(path.join(_dirname, '/Frontend/dist')));

// Catch-all route to handle other frontend routes
// Compute your project root (MediInsight)
const projectRoot = path.resolve(__dirname, '..');

app.use('/', express.static(path.join(projectRoot, 'Frontend', 'dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(projectRoot, 'Frontend', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000; // Use dynamic port from environment variable or default to 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
