const express = require("express");
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require('node-cron');
const fs = require('fs');
const { Parser } = require('json2csv');
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const session = require("express-session");
//const QRSession = require("./models/QRSession");
const StudentModel = require("./models/transport.js");
const BusSeat = require("./models/BusSeat");
const FacultyRequest = require("./models/facultyRequest.js");

//const OtpModel = require("./models/Otp.js");
const BusDetailModel = require("./models/busDetails.js");
const HolidayModel = require("./models/holiday.js");
const SeatBooking = require("./models/SeatBooking.js");
const BusBookingModel = require("./models/busbooking.js");
const BusNoBookingModel = require("./models/busnobooking.js");
//const Attendance = require("./models/attendance.js");
const Faculty=require("./models/faculty.js");

const Admin=require("./models/admin.js");
dotenv.config(); // Load environment variables from .env file
const { OAuth2Client } = require('google-auth-library');
const TransportRoute = require('./models/busMap.js');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
app.use(express.json());
const YOUR_COMPUTER_IP = '192.168.160.194';
// CORS configuration to allow requests from your frontend
app.use(cors({
  origin: [
    'http://localhost:5174'
  ], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
// Express session configuration for session management
app.use(session({ 
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: true,
}));
const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  date: Date,
  status: String, // 'present' or 'absent'
  sessionId: String,
  markedBy: String // 'qr' or 'otp'
});

const qrSessionSchema = new mongoose.Schema({
  sessionId: String,
  date: Date,
  facultyEmail: String,
  expiresAt: { type: Date, index: { expires: '5m' } } // Auto-delete after 5 minutes
});

const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true
  },
  facultyEmail: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30*1000) // Default to 30 seconds from now
  }
});

// Create TTL index (must be done before model creation)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
const QrSession = mongoose.model('QrSession', qrSessionSchema);
const Otp = mongoose.model('Otp', otpSchema);

app.post('/qr-session', async (req, res) => {
  const { sessionId, date, facultyEmail } = req.body; // <-- include facultyEmail here

  console.log("Session User:", req.session?.user);
  console.log("Faculty Email:", facultyEmail);

  try {
    // Delete all previous QR sessions by the same faculty
    await QrSession.deleteMany({ facultyEmail });

    const qrSession = new QrSession({
      sessionId,
      date: new Date(date),
      facultyEmail,
      expiresAt: new Date(Date.now() + 30 * 1000) // expires in 5 minutes
    });

    await qrSession.save();
    res.json({ message: 'QR session created', sessionId });
  } catch (err) {
    console.error("QR session error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Generate OTP
app.post('/store-otp', async (req, res) => {
  

  const { email, otp } = req.body;
  try {
    await Otp.deleteMany({ facultyEmail: email });
    const otpRecord = new Otp({
      otp,
      facultyEmail: email,
      expiresAt: new Date(Date.now() + 30 * 1000) // 5 minutes from now
    });

    await otpRecord.save();
    res.json({ message: 'OTP stored successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and mark attendance
app.post('/mark-attendance-otp', async (req, res) => {
  const { otp, studentEmail } = req.body;
  try {
    
    // Verify OTP
    const otpRecord = await Otp.findOne({ otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    

    // Get student
    const student = await StudentModel.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if already marked attendance for this session
    const existingAttendance = await Attendance.findOne({
      studentId: student._id,
      sessionId: `otp-${otp}`
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked' });
    }

    // Create attendance record
    const attendance = new Attendance({
      studentId: student._id,
      date: new Date(),
      status: 'present',
      sessionId: `otp-${otp}`,
      markedBy: 'otp'
    });

    await attendance.save();
    res.json({ message: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify QR code and mark attendance
app.post('/mark-attendance-qr', async (req, res) => {
  const { sessionId, studentEmail } = req.body;
  try {
    // Verify QR session
    const qrSession = await QrSession.findOne({ sessionId });
    if (!qrSession) {
      return res.status(400).json({ message: 'Invalid QR session' });
    }

    // Get student
    const student = await StudentModel.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if already marked attendance for this session
    const existingAttendance = await Attendance.findOne({
      studentId: student._id,
      sessionId
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked' });
    }

    // Create attendance record
    const attendance = new Attendance({
      studentId: student._id,
      date: qrSession.date,
      status: 'present',
      sessionId,
      markedBy: 'qr'
    });

    await attendance.save();
    res.json({ message: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/google-auth', async (req, res) => {
  const { token } = req.body;

  // 1. Input validation
  if (!token) {
    return res.status(400).json({ 
      success: false,
      error: 'MISSING_TOKEN',
      message: 'Google token is required'
    });
  }

  try {
    // 2. Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    // 3. Validate required payload fields
    if (!payload?.email || !payload?.name) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PAYLOAD',
        message: 'Google token payload is missing required fields'
      });
    }



    // 5. Find or create user
    const user = await user.findOneAndUpdate(
      { email: payload.email },
      {
        $setOnInsert: { // Only set these on creation
          name: payload.name,
          authMethod: 'google',
          createdAt: new Date()
        },
        $set: { // Always update these
          lastLogin: new Date(),
          googleId: payload.sub
        }
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    // 6. Generate session token
    const sessionToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 7. Set secure HTTP-only cookie
    res.cookie('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // 8. Successful response
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });

  } catch (err) {
    console.error('Google auth error:', err);
    
    // Handle specific error cases
    if (err.message.includes('Token used too late')) {
      return res.status(401).json({
        success: false,
        error: 'EXPIRED_TOKEN',
        message: 'Google token has expired'
      });
    }

    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Authentication failed'
    });
  }
});

app.get('/api/buses', async (req, res) => {
  try {
    const routes = await BusDetailModel.find();
    res.status(200).json(routes);
  } catch (err) {
    console.error('Error fetching bus data:', err);
    res.status(500).json({ error: 'Failed to fetch bus routes' });
  }
});
// Backend route (Node.js + Express)
app.post('/api/bus-coordinates', async (req, res) => {
  const { source } = req.body;
  try {
    const bus = await BusDetailModel.findOne({ source: { $regex: new RegExp(source, 'i') } });
    if (!bus || !bus.from || !bus.to) {
      return res.status(404).json({ message: 'Coordinates not found' });
    }
    res.json({ from: bus.from, to: bus.to });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


app.post('/faculty/register-request', async (req, res) => {
  try {
    const { name, department, contact, place, email, password } = req.body;

    // Check if a request with the same email already exists
    const existingRequest = await FacultyRequest.findOne({ email });
    if (existingRequest) {
      return res.status(400).json({ message: 'A request with this email already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the request
    const newRequest = new FacultyRequest({
      name,
      department,
      contact,
      place,
      email,
      password: hashedPassword
    });

    await newRequest.save();
    res.json({ message: 'Registration request sent to admin' });
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/approve/:id', async (req, res) => {
  const request = await FacultyRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  const newFaculty = new Faculty({
    name: request.name,
    department: request.department,
    contact: request.contact,
    place: request.place,
    email: request.email,
    password: request.password // You can hash before saving
  });

  await newFaculty.save();
  await FacultyRequest.findByIdAndDelete(req.params.id);
  res.json({ message: 'Faculty approved and added to system' });
});

app.delete('/reject/:id', async (req, res) => {
  try {
    const request = await FacultyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    await FacultyRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Faculty request rejected and removed' });
  } catch (err) {
    console.error('Rejection error:', err);
    res.status(500).json({ message: 'Server error during rejection' });
  }
});


app.get('/faculty/requests', async (req, res) => {
  try {
    const requests = await FacultyRequest.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});


let savedQrValues = new Set(); 
const bodyParser = require("body-parser");
const facultyRequest = require("./models/facultyRequest.js");

// Use this middleware for parsing URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));


const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};

// API to Generate QR Code Session with OTP
app.post("/qr-session", async (req, res) => {
  try {
    const { sessionId, date } = req.body;
    const otp = generateOtp();

    // Store session details in the database
    const newSession = new QRSession({ sessionId, date, otp });
    await newSession.save();

    res.status(200).json({ message: "QR Session created!", otp });
  } catch (err) {
    console.error("Error saving QR session:", err);
    res.status(500).json({ error: "Failed to generate QR code session." });
  }
});

app.post('/api/save-qr', (req, res) => {
  const { qrValue } = req.body;
  savedQrValues.add(qrValue);
  res.status(200).send({ message: 'QR Value saved' });
});



app.get("/booked-seats", async (req, res) => {
  try {
    const { busNo } = req.query;
    const bookedSeats = await BusSeat.find({ busNo }).select("seatNumber -_id"); 
    res.json(bookedSeats.map(seat => seat.seatNumber));
  } catch (error) {
    res.status(500).json({ error: "Error fetching booked seats" });
  }
});

// ✅ Book a seat for a user
app.post("/save-seat", async (req, res) => {
  try {
    const { busNo, seatNumber, email } = req.body;

    // Check if the seat is already booked
    const existingBooking = await BusSeat.findOne({ busNo, seatNumber });
    if (existingBooking) {
      return res.status(400).json({ message: "Seat is already booked." });
    }

    // Save new seat booking
    const newBooking = new BusSeat({ busNo, seatNumber, email });
    await newBooking.save();

    // Send email confirmation
    await sendEmail(email, "Seat Booking Confirmation", `Your seat number ${seatNumber} on bus ${busNo} has been successfully booked.`);

    res.status(200).json({ message: "Seat booked successfully!", booking: newBooking });
  } catch (error) {
    res.status(500).json({ error: "Error saving seat" });
  }
});





// Fetch all bus details

app.post('/store-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
      // Store OTP in the database (adjust model accordingly)
      await OtpModel.create({ email, otp, createdAt: new Date() });

      res.status(200).json({ message: 'OTP stored successfully' });
  } catch (error) {
      console.error('Error storing OTP:', error);
      res.status(500).json({ message: 'Failed to store OTP' });
  }
});

app.post('/mark-attendance', async (req, res) => {
  const { sessionId, otp, email } = req.body;

  if (!email) return res.status(400).json({ message: 'Student email is required!' });

  if (!sessionId && !otp) {
    return res.status(400).json({ message: 'Either sessionId or OTP is required' });
  }

  try {
    const student = await StudentModel.findOne({ email });
    console.log(student);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const studentId = student._id;
    let isValid = false;

    if (!sessionId && !otp) return res.status(400).json({ message: 'QR Code or OTP is required!' });

    if (sessionId && !otp) {
      const session = await QrSession.findOne({ sessionId });
      if (!session) return res.status(400).json({ message: 'Invalid QR session.' });
      isValid = true;
    }

    if (otp && sessionId) {
      const otpRecord = await OtpModel.findOne({ sessionId, otp });
      if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP.' });

      isValid = true;
      await OtpModel.deleteOne({ _id: otpRecord._id });
    }

    if (!isValid) return res.status(400).json({ message: 'Invalid QR Code or OTP.' });

    const today = new Date().toISOString().split('T')[0];
    const existing = await Attendance.findOne({ studentId, sessionId, date: today });
    if (existing) return res.status(400).json({ message: 'Attendance already marked!' });

    await Attendance.create({ studentId, sessionId, date: today, status: 'Present' });

    res.status(200).json({ message: 'Attendance marked successfully!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});




app.post('/submit-attendance', async (req, res) => {
  const { sessionId, otp, email } = req.body;

  try {
    let sessionDate;

    if (sessionId) {
      // Attendance via QR Code
      const session = await QrSession.findOne({ sessionId });
      if (!session) return res.status(400).send('Invalid QR Code.');
      sessionDate = session.date;
    } else if (otp) {
      // Attendance via OTP
      const otpRecord = await OtpModel.findOne({ email, otp, sessionId });
      if (!otpRecord) return res.status(400).send('Invalid OTP or session expired.');

      sessionDate = new Date().toISOString().split('T')[0];

      // Delete OTP after verification (prevents reuse)
      await OtpModel.deleteOne({ _id: otpRecord._id });
    } else {
      return res.status(400).send('Either QR Code or OTP is required!');
    }

    // Validate student
    const student = await StudentModel.findOne({ email });
    if (!student) return res.status(400).send('Email not registered.');

    // Mark attendance
    await Attendance.create({
      studentId: student._id,
      date: sessionDate,
      status: 'Present',
    });

    res.status(200).send('Attendance marked successfully!');
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).send('Server error. Please try again.');
  }
});

const archiveFolder = './attendance-archive';
if (!fs.existsSync(archiveFolder)) {
  fs.mkdirSync(archiveFolder);
}
cron.schedule('* * * * *', async () => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Fetch attendance older than one week
    const oldAttendance = await Attendance.find({ date: { $lt: oneWeekAgo } });

    if (oldAttendance.length === 0) {
      //console.log('No attendance records to archive.');
      return;
    }

    // Map attendance records and fetch student details
    const attendanceData = [];
    for (const record of oldAttendance) {
      const student = await StudentModel.findById(record.studentId); // `studentId` is assumed to reference the ObjectId
      if (student) {
        attendanceData.push({
          rollno: student.rollno,
          name: student.name,
          status: record.status, // Present/Absent
          //date: record.date.toISOString().slice(0, 10), // Format date as YYYY-MM-DD
        });
      }
    }

    // Generate the CSV file
    const csvHeader = 'Roll No,Name,Status,Date\n';
    const csvRows = attendanceData
      .map(
        (entry) =>
          `${entry.rollno},${entry.name},${entry.status},${entry.date}`
      )
      .join('\n');

    const csvContent = csvHeader + csvRows;

    // Save CSV file with timestamp
    const fileName = `${archiveFolder}/attendance-${new Date()
      .toISOString()
      .replace(/[:.]/g, '-')}.csv`;
    fs.writeFileSync(fileName, csvContent);

    console.log(`Archived attendance saved as ${fileName}`);

    // Delete old attendance records
    await Attendance.deleteMany({ date: { $lt: oneWeekAgo } });
    console.log('Old attendance records deleted from database.');
  } catch (error) {
    console.error('Error archiving attendance:', error);
  }
});
app.post('/qr-session', async (req, res) => {
  const { sessionId, date } = req.body;

  try {
    // Check if a session with the same ID already exists
    const existingSession = await QrSession.findOne({ sessionId });
    if (existingSession) {
      return res.status(400).json({ message: 'Session ID already exists' });
    }

    // Save the session
    const newSession = new QrSession({ sessionId, date });
    await newSession.save();

    res.status(200).json({ message: 'QR session saved successfully' });
  } catch (err) {
    console.error('Error saving QR session:', err);
    res.status(500).json({ message: 'Failed to save QR session' });
  }
});

app.get('/bus-details', async (req, res) => {
  try {
    const busdata = await BusDetailModel.find();
    if (!busdata.length) {
      return res.status(404).json({ message: 'No bus details data available.' });
    }
    res.json(busdata);
  } catch (error) {
    console.error('Error fetching bus details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
/*app.get('/students', async (req, res) => {
  try {
    const studentsData = await StudentModel.find();
    if (!studentsData.length) {
      return res.status(404).json({ message: 'No student details data available.' });
    }
    res.json(studentsData);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/busSource', async (req, res) => {
  try {
    const busSourceData = await BusBookingModel.find();
    if (!busSourceData.length) {
      return res.status(404).json({ message: 'No student details data available.' });
    }
    res.json(busSourceData);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/busNo', async (req, res) => {
  try {
    const busNoData = await BusNoBookingModel.find();
    if (!busNoData.length) {
      return res.status(404).json({ message: 'No student details data available.' });
    }
    res.json(busNoData);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});*/
app.get('/combined-students', async (req, res) => {
  try {
    const students = await StudentModel.find({});
    const busSources = await BusBookingModel.find({});
    const busNumbers = await BusSeat.find({});

    // Merge data based on email
    const combinedData = students.map(student => {
      const busSource = busSources.find(source => source.email === student.email);
      const busNo = busNumbers.find(bus => bus.email === student.email);

      return {
        id: student._id.toString(),
        name: student.name,
        gender: student.gender,
        email: student.email,
        rollno:student.rollno,
        busSource: busSource ? busSource.busSource : null,
        busNo: busNo ? busNo.busNo : null,
      };
    });

    res.json(combinedData);
    
  } catch (error) {
    res.status(500).send('Error fetching combined student data');
  }
});

// Update student details route
app.put('/update-student', async (req, res) => {
  const { email, name, gender, busSource, busNo } = req.body;

  try {
    // Fetch student document by email
    const student = await StudentModel.findOne({ email });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update student details
    student.name = name || student.name;
    student.gender = gender || student.gender;
    await student.save();

    // Fetch and update bus source details
    const busSourceDoc = await BusBookingModel.findOne({ email });
    if (busSourceDoc) {
      busSourceDoc.busSource = busSource || busSourceDoc.busSource;
      await busSourceDoc.save();
    }

    // Fetch and update bus number details
    const busNoDoc = await BusSeat.findOne({ email });
    if (busNoDoc) {
      busNoDoc.busNo = busNo || busNoDoc.busNo;
      await busNoDoc.save();
    }

    res.status(200).json({ message: 'Student details updated successfully' });
  } catch (error) {
    console.error('Error updating student details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/holidays', async (req, res) => {
  try {
    const holiday = new HolidayModel(req.body);
    await holiday.save();
    res.status(201).send({ message: 'Holiday added successfully', holiday });
  } catch (error) {
    res.status(400).send({ message: 'Failed to add holiday', error });
  }
});

app.get('/api/holidays', async (req, res) => {
  try {
    const holidays = await HolidayModel.find();
    res.status(200).send(holidays);
  } catch (error) {
    res.status(500).send({ message: 'Failed to fetch holidays', error });
  }
});
app.get('/bus-sources-with-numbers', async (req, res) => {
  try {
    // Fetch all bus details
    const busDetails = await BusDetailModel.find();
    const busData = {}; // Object to store bus sources and their respective bus numbers

    busDetails.forEach((busDetail) => {
      const busSource = busDetail.source; // Extract the source
      const dataMap = busDetail.data; // Keep it as a Map

      console.log('Bus Source:', busSource); // Log the source
      console.log('Data Map:', dataMap); // Log the data map

      // Extract bus numbers directly from the Map entries
      const busNumbers = Array.from(dataMap.values())
        .map((column) => column.busNo)
        .filter(Boolean);

      console.log('Bus Numbers:', busNumbers); // Log extracted bus numbers

      if (!busData[busSource]) {
        busData[busSource] = [];
      }

      // Ensure unique busNo values for each source
      busData[busSource] = [...new Set([...busData[busSource], ...busNumbers])];
    });

    // Respond with the formatted bus data
    res.json(busData);
  } catch (error) {
    console.error('Error fetching bus sources and numbers:', error);
    res.status(500).send('Error fetching bus sources and numbers');
  }
});



// Fetch specific bus details by ID
app.get('/bus-details/:id', async (req, res) => {
  const busId = req.params.id;

  try {
    const busDetails = await BusDetailModel.findOne({ id: busId });
    if (!busDetails) {
      return res.status(404).json({ message: 'No bus details data available.' });
    }
    res.json(busDetails);
  } catch (error) {
    console.error('Error fetching bus details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/studentDetails', async (req, res) => {
  try {
    const email = req.query.email; // Extract email from query parameters

    // Ensure email is provided
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Query the database for a student matching the email
    const student = await StudentModel.findOne({ email });

    if (!student) {
      return res.status(404).json({ error: "No student found with the provided email" });
    }

    // Fetch attendance records for the student
    //const attendanceRecords = await AttendanceModel.find({ studentId: student._id });

    // Return the student's details along with attendance records
    res.json({
      details:{
        name: student.name,
        rollno: student.rollno,
        degree: student.degree,
        dept: student.dept,
        year: student.year,
        gender: student.gender,
        email: student.email,
        dob: student.dob,
        address: student.address,
        phoneno: student.phoneno,
      },
      //attendance: attendanceRecords,
  });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).send("Error fetching student details");
  }
});


// Create new bus details
app.post('/bus-details', async (req, res) => {
  try {
    const newBusDetail = new BusDetailModel(req.body);
    const savedBusDetail = await newBusDetail.save();
    res.status(201).json(savedBusDetail);
  } catch (error) {
    console.error('Error creating bus details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bus details by ID
app.put('/bus-details/:id', async (req, res) => {
  const busId = req.params.id;

  try {
    const updatedBusDetails = await BusDetailModel.findOneAndUpdate({ id: busId }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBusDetails) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    res.json(updatedBusDetails);
  } catch (error) {
    console.error('Error updating bus details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete bus details by ID
app.delete('/bus-details/:id', async (req, res) => {
  const busId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(busId)) {
    return res.status(400).json({ error: 'Invalid bus ID' });
  }

  try {
    const deletedBus = await BusDetailModel.findByIdAndDelete(busId);
    if (!deletedBus) {
      return res.status(404).json({ error: 'Bus not found' });
    }
    res.json({ message: 'Bus deleted successfully' });
  } catch (error) {
    console.error('Error deleting bus details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin login route
app.post("/admin/login", async(req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email:email });
    
    // Log the entered email and the one retrieved from the database
    console.log("Entered email:", email);
    console.log("Faculty email from DB:", admin ? admin.email : "Not found");

    if (!admin) {
      return res.status(403).json("Invalid email or password");
    }

    // const isValidPassword = await bcrypt.compare(password, faculty.password);
    if (password != admin.password) {
      return res.status(403).json("Invalid email or password");
    }

    res.json("Success");
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
});

  /*if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    res.json("Success"); 
  } else {
    res.status(403).json("Invalid email or password"); 
  }
});*/
app.post("/faculty/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const faculty = await Faculty.findOne({ email:email });
    
    // Log the entered email and the one retrieved from the database
    console.log("Entered email:", email);
    console.log("Faculty email from DB:", faculty ? faculty.email : "Not found");

    if (!faculty) {
      return res.status(403).json("Invalid email or password");
    }

    // const isValidPassword = await bcrypt.compare(password, faculty.password);
    if (password != faculty.password) {
      return res.status(403).json("Invalid email or password");
    }

    res.json("Success");
  } catch (err) {
    console.error(err);
    res.status(500).json("Internal Server Error");
  }
});
app.post('/attendance', async (req, res) => {
  const { date, attendance, sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  try {
    for (const [studentId, status] of Object.entries(attendance)) {
      await Attendance.create({
        studentId,
        sessionId,
        date,
        status: status ? 'Present' : 'Absent'
      });
    }
    res.status(200).send('Attendance saved successfully');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save attendance' });
  }
});

app.get('/attendance', async (req, res) => {
  const { date } = req.query;
  //console.log(`\n[1] Received request for date: ${date}`);

  try {
    // Create date range for query
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`[2] Query date range: ${startOfDay} to ${endOfDay}`);

    // Fetch all students
    const students = await StudentModel.find();
    console.log(`[3] Found ${students.length} students in database`);

    // Fetch attendance records
    const attendanceRecords = await Attendance.find({
      date: { 
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    console.log(`[4] Found ${attendanceRecords.length} attendance records for this date`);
    console.log('[5] Sample attendance records:', 
      attendanceRecords.slice(0, 3).map(r => ({
        studentId: r.studentId,
        date: r.date,
        status: r.status
      }))
    );

    // Create attendance map
    const attendanceMap = attendanceRecords.reduce((acc, record) => {
      acc[record.studentId.toString()] = record.status;
      return acc;
    }, {});

    // Combine results
    const result = students.map((student) => ({
      rollno: student.rollno,
      name: student.name,
      status: attendanceMap[student._id.toString()] || 'Absent',
    }));

    console.log('[6] Final result sample:', result.slice(0, 3));
    res.json(result);
    
  } catch (err) {
    console.error('[ERROR] Failed to fetch attendance:', err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

app.get('/students', async (req, res) => {
  try {
    const students = await StudentModel.find(); // Replace `Student` with your student model
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Middleware to check admin access
const isAdmin = (req, res, next) => {
  const { email } = req.body;
  if (email === process.env.ADMIN_EMAIL) {
    next(); 
  } else {
    res.status(403).json({ error: 'Unauthorized access' }); 
  }
};

// Fetch all student registrations (admin only)
app.get('/admin/registrations', isAdmin, async (req, res) => {
  try {
    const registrations = await StudentModel.find();
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Student login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  StudentModel.findOne({ email: email })
    .then((user) => {
      if (user && user.rollno === password) {
        res.json("Success"); 
      } else {
        res.status(403).json("Invalid email or password"); 
      }
    })
    .catch((err) => res.status(500).json(err));
});

// Student registration route
app.post("/register", async (req, res) => {
  const { name, rollno, degree, dept, year, gender, email, dob, address, phoneno,parentno } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email address is required for registration" });
  }

  try {
    // Check if the email or roll number is already registered
    const existingStudent = await StudentModel.findOne({ $or: [{ email }, { rollno }] });
    if (existingStudent) {
      if (existingStudent.email === email) {
        return res.status(400).json({ error: "Email already registered" });
      } else if (existingStudent.rollno === rollno) {
        return res.status(400).json({ error: "Roll number already registered" });
      }
    }

    // Create a new student record
    const student = await StudentModel.create({ name, rollno, degree, dept, year, gender, email, dob, address, phoneno,parentno });

    // Send confirmation email
    //sendEmail(email);

    res.status(201).json(student);

  } catch (err) {
    res.status(500).json({ error: "An error occurred during registration" });
  }
});
app.post('/admin/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required for registration" });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create a new admin without password hashing
    const admin = await Admin.create({ email, password });

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred during registration" });
  }
});



const sendEmail = (email, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // Secure connection for port 465
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false // Ignores self-signed certificates
    }
  });

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: subject,
    text: text,
  };

  // Send the email
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error occurred:", error.message);
        return reject(error);
      } else {
        console.log("Email sent:", info.response);
        return resolve(info);
      }
    });
  });
};

// Your API endpoint to save bus number and send email confirmation
app.post('/save-bus-number', async (req, res) => {
  const { email, busNo, column } = req.body;

  if (!email || !busNo || !column) {
    return res.status(400).json({ error: 'Email, Bus Number, and Column are required' });
  }

  try {
    const busRoute = await BusDetailModel.findOne({
      [`data.${column}.busNo`]: busNo
    });

    if (!busRoute) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    const busData = busRoute.data.get(column);
    if (busData.vacancy <= 0) {
      return res.status(400).json({ error: 'No vacancy available for this bus' });
    }

    // Update seatsAllocated and vacancy
    busData.seatsAllocated += 1;
    busData.vacancy -= 1;

    // Save the updated bus route details
    await busRoute.save();

    // Check if the user already booked the same bus
    const existingBooking = await BusSeat.findOne({ email, busNo });
    if (existingBooking) {
      return res.status(400).json({ error: 'You have already registered for this bus' });
    }

    // Create a new bus booking record in the database
    const busBooking = await BusSeat.create({ email, busNo });

    // Define the email content
    const subject = 'Bus Booking Confirmation';
    const text = `You have successfully registered for bus number ${busNo}. Thank you for booking with us.`;

    // Send the email using the sendEmail function
    await sendEmail(email, subject, text);

    return res.status(200).json({ message: 'Bus number saved and confirmation email sent', busBooking });
  } catch (err) {
    console.error('Error saving bus number:', err);
    return res.status(500).json({ error: 'An error occurred while saving the bus number or sending the email' });
  }
});


app.post('/save-bus-booking', (req, res) => {
  const { email, busSource } = req.body;

  // Validate required fields
  if (!email || !busSource) {
    return res.status(400).json({ error: "Email, bus source, and bus number are required" });
  }

  // Create and save the booking in the database
  BusBookingModel.create({ email, busSource})
    .then((booking) => {
      res.status(200).json({ message: 'Bus booking saved successfully', booking });
    })
    .catch((err) => {
      console.error("Error saving bus booking:", err);
      res.status(500).json({ error: "Failed to save bus booking" });
    });
});



// Send bus registration email
app.post('/send-registration-email', (req, res) => {
  const { email, busDetails } = req.body;

  sendEmail(email, 'Bus Registration Successful', `You have successfully registered for bus number ${busDetails.busNumber} on route ${busDetails.route}.`)
    .then(() => {
      res.status(200).json({ message: 'Email sent successfully' });
    })
    .catch((err) => {
      console.error("Email not sent:", err);
      res.status(500).json({ error: 'Email could not be sent' });
    });
});
app.get('/bus-seats/:busNo', async (req, res) => {
  const { busNo } = req.params;

  try {
    const bus = await BusDetailModel.findOne({ busNo });
    console.log(bus);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found.' });
    }

    res.status(200).json(bus.busSeats);
  } catch (error) {
    console.error('Error fetching bus seats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/seat-booking', async (req, res) => {
  const { busNo, seatNumber, email } = req.body;

  try {
    // Check if the seat is already booked
    const existingBooking = await SeatBooking.findOne({ busNo, seatNumber });
    if (existingBooking) {
      return res.status(400).json({ message: 'Seat is already booked.' });
    }

    // Create a new booking
    const newBooking = new SeatBooking({ busNo, seatNumber, email });
    await newBooking.save();

    // Send confirmation email
    await sendEmail(email, 'Seat Booking Confirmation', `Your seat number ${seatNumber} on bus ${busNo} has been successfully booked.`);

    res.status(200).json({ message: 'Seat booked successfully!', booking: newBooking });
  } catch (error) {
    console.error('Error booking seat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch all booked seats for a bus
app.get('/seat-booking/:busNo', async (req, res) => {
  const { busNo } = req.params;

  try {
    const bookings = await SeatBooking.find({ busNo });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch specific booking details by seat number and bus number
app.get('/seat-booking/:busNo/:seatNumber', async (req, res) => {
  const { busNo, seatNumber } = req.params;

  try {
    const booking = await SeatBooking.findOne({ busNo, seatNumber });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel a seat booking
app.delete('/seat-booking/:busNo/:seatNumber', async (req, res) => {
  const { busNo, seatNumber } = req.params;

  try {
    const deletedBooking = await SeatBooking.findOneAndDelete({ busNo, seatNumber });
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.status(200).json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(3009, () => {
  console.log("Server is running on port 3009");
});
