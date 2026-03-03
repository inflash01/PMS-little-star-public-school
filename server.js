const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'admissions.json');

// Helper function to read data
function readAdmissions() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Helper function to write data
function writeAdmissions(admissions) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(admissions, null, 2));
}

// ============ ROUTES ============

// 1. Home route - serve the website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 1b. Admin route - serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// 2. API: Submit admission form
app.post('/api/admission', (req, res) => {
    try {
        const { parentName, phone, email, childName, classJoin, message } = req.body;

        // Validation
        if (!parentName || !phone || !childName || !classJoin) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields!'
            });
        }

        // Read existing admissions
        const admissions = readAdmissions();

        // Create new admission record
        const newAdmission = {
            id: Date.now(),
            date: new Date().toISOString(),
            parentName: parentName.trim(),
            phone: phone.trim(),
            email: email ? email.trim() : '',
            childName: childName.trim(),
            classJoin: classJoin,
            message: message ? message.trim() : '',
            status: 'new'
        };

        // Add to array
        admissions.push(newAdmission);

        // Save to file
        writeAdmissions(admissions);

        console.log('🎉 New Admission Received!');
        console.log(newAdmission);

        res.json({
            success: true,
            message: 'Application submitted successfully! We will contact you soon.',
            admissionId: newAdmission.id
        });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again.'
        });
    }
});

// 3. API: Get all admissions (for admin)
app.get('/api/admissions', (req, res) => {
    try {
        const admissions = readAdmissions();
        res.json({
            success: true,
            count: admissions.length,
            admissions: admissions.reverse() // Most recent first
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching admissions'
        });
    }
});

// 4. API: Get single admission by ID
app.get('/api/admission/:id', (req, res) => {
    try {
        const admissions = readAdmissions();
        const admission = admissions.find(a => a.id == req.params.id);
        
        if (!admission) {
            return res.status(404).json({
                success: false,
                message: 'Admission not found'
            });
        }

        res.json({
            success: true,
            admission: admission
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching admission'
        });
    }
});

// 5. API: Update admission status
app.put('/api/admission/:id', (req, res) => {
    try {
        const admissions = readAdmissions();
        const index = admissions.findIndex(a => a.id == req.params.id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Admission not found'
            });
        }

        admissions[index] = { ...admissions[index], ...req.body };
        writeAdmissions(admissions);

        res.json({
            success: true,
            message: 'Admission updated successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating admission'
        });
    }
});

// 6. API: Delete admission
app.delete('/api/admission/:id', (req, res) => {
    try {
        let admissions = readAdmissions();
        const initialLength = admissions.length;
        admissions = admissions.filter(a => a.id != req.params.id);

        if (admissions.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Admission not found'
            });
        }

        writeAdmissions(admissions);

        res.json({
            success: true,
            message: 'Admission deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting admission'
        });
    }
});

// 7. API: Get admission count/stats
app.get('/api/stats', (req, res) => {
    try {
        const admissions = readAdmissions();
        
        const stats = {
            total: admissions.length,
            new: admissions.filter(a => a.status === 'new').length,
            contacted: admissions.filter(a => a.status === 'contacted').length,
            enrolled: admissions.filter(a => a.status === 'enrolled').length,
            rejected: admissions.filter(a => a.status === 'rejected').length
        };

        res.json({
            success: true,
            stats: stats
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stats'
        });
    }
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   🎓 Little Star Public School - Backend Server           ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║   🚀 Server running at: http://localhost:${PORT}             ║`);
    console.log('║                                                            ║');
    console.log('║   📝 Website & Admin:                                    ║');
    console.log('║   Main Website: http://localhost:3000                    ║');
    console.log('║   Admin Panel: http://localhost:3000/admin               ║');
    console.log('║                                                            ║');
    console.log('║   📝 API Endpoints:                                        ║');
    console.log('║   POST /api/admission     - Submit admission form          ║');
    console.log('║   GET  /api/admissions   - View all admissions            ║');
    console.log('║   GET  /api/admission/:id - View single admission         ║');
    console.log('║   PUT  /api/admission/:id - Update admission status       ║');
    console.log('║   DELETE /api/admission/:id - Delete admission             ║');
    console.log('║   GET  /api/stats        - View admission statistics       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
});
