
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  NavLink
} from "react-router-dom";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Nav, 
  Navbar, 
  Spinner, 
  Modal,
  Badge,
  Table
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// API Configuration and Authentication Helpers
const API_BASE = "http://localhost:5001/api";
const tokenKey = "prms_token";

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

function removeToken() {
  localStorage.removeItem(tokenKey);
}

// Enhanced Fetch Authentication Function
async function fetchAuth(url, options = {}) {
  const token = getToken();
  
  const defaultOptions = {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (response.status === 401) {
      removeToken();
      window.location.href = '/login';
      throw new Error('Unauthorized access');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Login Component
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAuth(`${API_BASE}/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (data.access_token) {
        setToken(data.access_token);
        onLogin();
        navigate('/patients');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Header>Login to Patient Record Management System</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter username"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

// Main Navigation Component
function MainNavbar({ isAuthenticated, onLogout }) {
  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">PRMS</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <Nav.Link as={NavLink} to="/patients">Patients</Nav.Link>
                <Nav.Link as={NavLink} to="/visits">Visits</Nav.Link>
                <Nav.Link as={NavLink} to="/prescriptions">Prescriptions</Nav.Link>
                <Nav.Link as={NavLink} to="/reports">Reports</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <Button variant="outline-light" onClick={onLogout}>
                Logout
              </Button>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

// Patients List Component
function PatientsList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    contact_info: ''
  });

  const navigate = useNavigate();

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await fetchAuth(`${API_BASE}/patients`);
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await fetchAuth(`${API_BASE}/patients`, {
        method: 'POST',
        body: JSON.stringify(newPatient)
      });
      setShowModal(false);
      loadPatients();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await fetchAuth(`${API_BASE}/patients/${patientId}`, {
          method: 'DELETE'
        });
        loadPatients();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Patients</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add New Patient
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading patients...</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {patients.map(patient => (
            <Col key={patient.id}>
              <Card>
                <Card.Body>
                  <Card.Title>{patient.name}</Card.Title>
                  <Card.Text>
                    <Badge bg="secondary">Age: {patient.age}</Badge>
                    <p className="mt-2">{patient.contact_info}</p>
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeletePatient(patient.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add Patient Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Patient</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddPatient}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={newPatient.name}
                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                value={newPatient.age}
                onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Contact Info</Form.Label>
              <Form.Control
                type="text"
                value={newPatient.contact_info}
                onChange={(e) => setNewPatient({...newPatient, contact_info: e.target.value})}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Patient
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

// Patient Details Component
// Add this to your existing code, replacing the current PatientDetails component

function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]); // Add reports state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('visits');
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState(null);
  
  // Add these two state variables
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [newReport, setNewReport] = useState({
    report_type: '',
    report_data: ''
  });

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      // Fetch patient details
      const patientData = await fetchAuth(`${API_BASE}/patients/${id}`);
      setPatient(patientData);
      // Create a copy for editing
      setEditedPatient({
        name: patientData.name,
        age: patientData.age,
        contact_info: patientData.contact_info
      });

      // Fetch patient visits
      const visitsData = await fetchAuth(`${API_BASE}/patients/${id}/visits`);
      setVisits(visitsData);

      // Fetch patient prescriptions
      const prescriptionsData = await fetchAuth(`${API_BASE}/patients/${id}/prescriptions`);
      setPrescriptions(prescriptionsData);

      // Fetch patient reports
      const reportsData = await fetchAuth(`${API_BASE}/patients/${id}/reports`);
      setReports(reportsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      // Validate input
      if (!editedPatient.name || !editedPatient.age || !editedPatient.contact_info) {
        setError("All fields are required");
        return;
      }

      // Call PUT API to update patient
      const updatedPatient = await fetchAuth(`${API_BASE}/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editedPatient.name,
          age: Number(editedPatient.age),
          contact_info: editedPatient.contact_info
        })
      });

      // Update local state
      setPatient(updatedPatient);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Add report handler
  const handleAddReport = async (e) => {
    e.preventDefault();
    try {
      // Validate inputs
      if (!newReport.report_type || !newReport.report_data) {
        setError("Please fill in all required fields");
        return;
      }

      // Add report
      await fetchAuth(`${API_BASE}/reports`, {
        method: 'POST',
        body: JSON.stringify({
          patient_id: Number(id),
          report_type: newReport.report_type,
          report_data: newReport.report_data
        })
      });

      // Refetch patient details to update reports
      await fetchPatientDetails();

      // Reset form and close modal
      setNewReport({
        report_type: '',
        report_data: ''
      });
      setShowAddReportModal(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading patient details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container>
        <Alert variant="warning">Patient not found</Alert>
      </Container>
    );
  }

  return (
    <Container>
      {/* Patient Information Card */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>{patient.name}</h2>
          <Button 
            variant={isEditing ? "secondary" : "primary"} 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Patient"}
          </Button>
        </Card.Header>
        <Card.Body>
          {isEditing ? (
            <Form onSubmit={handleEdit}>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={editedPatient.name}
                      onChange={(e) => setEditedPatient({
                        ...editedPatient, 
                        name: e.target.value
                      })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Age</Form.Label>
                    <Form.Control
                      type="number"
                      value={editedPatient.age}
                      onChange={(e) => setEditedPatient({
                        ...editedPatient, 
                        age: e.target.value
                      })}
                      required
                      min="0"
                      max="150"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Contact Information</Form.Label>
                <Form.Control
                  type="text"
                  value={editedPatient.contact_info}
                  onChange={(e) => setEditedPatient({
                    ...editedPatient, 
                    contact_info: e.target.value
                  })}
                  required
                />
              </Form.Group>
              {error && <Alert variant="danger">{error}</Alert>}
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </Form>
          ) : (
            <Row>
              <Col>
                <strong>Age:</strong> {patient.age}
              </Col>
              <Col>
                <strong>Contact:</strong> {patient.contact_info}
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav.Item>
          <Nav.Link eventKey="visits">Visits</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="prescriptions">Prescriptions</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="reports">Reports</Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === 'visits' && (
        <Card className="mt-3">
          <Card.Header>Visits</Card.Header>
          <Card.Body>
            {visits.length === 0 ? (
              <p>No visits recorded</p>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Diagnosis</th>
                    <th>Doctor</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr key={visit.visit_id}>
                      <td>{new Date(visit.visit_date).toLocaleDateString()}</td>
                      <td>{visit.diagnosis}</td>
                      <td>{visit.doctor}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {activeTab === 'prescriptions' && (
        <Card className="mt-3">
          <Card.Header>Prescriptions</Card.Header>
          <Card.Body>
            {prescriptions.length === 0 ? (
              <p>No prescriptions recorded</p>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Drug Name</th>
                    <th>Dosage</th>
                    <th>Duration</th>
                    <th>Doctor</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.prescription_id}>
                      <td>{prescription.drug_name}</td>
                      <td>{prescription.dosage}</td>
                      <td>{prescription.duration}</td>
                      <td>{prescription.doctor}</td>
                      <td>{new Date(prescription.visit_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card className="mt-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Reports</span>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setShowAddReportModal(true)}
            >
              Add Report
            </Button>
          </Card.Header>
          <Card.Body>
            {reports.length === 0 ? (
              <p>No reports recorded</p>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {reports.map((report) => (
                  <Col key={report.report_id}>
                    <Card>
                      <Card.Body>
                        <Card.Title>{report.report_type}</Card.Title>
                        <Card.Text>
                          {report.report_data}
                          <br />
                          <small className="text-muted">
                            Created: {new Date(report.created_at).toLocaleString()}
                          </small>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Add Report Modal */}
      <Modal show={showAddReportModal} onHide={() => setShowAddReportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Report for {patient.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddReport}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Report Type</Form.Label>
              <Form.Select
                value={newReport.report_type}
                onChange={(e) => setNewReport({
                  ...newReport, 
                  report_type: e.target.value
                })}
                required
              >
                <option value="">Select Report Type</option>
                <option value="Lab Test">Lab Test</option>
                <option value="Radiology">Radiology</option>
                <option value="Blood Work">Blood Work</option>
                <option value="Physical Examination">Physical Examination</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Report Details</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={newReport.report_data}
                onChange={(e) => setNewReport({
                  ...newReport, 
                  report_data: e.target.value
                })}
                required
                placeholder="Enter detailed report information"
              />
            </Form.Group>
            {error && <Alert variant="danger">{error}</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddReportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Report
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
// Visits Page
function VisitsPage() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [newVisit, setNewVisit] = useState({
    patient_id: '',
    diagnosis: '',
    doctor_id: 1 // Default doctor, adjust as needed
  });

  // Fetch visits and patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch visits
        const visitsData = await fetchAuth(`${API_BASE}/visits`);
        setVisits(visitsData);

        // Fetch patients for dropdown
        const patientsData = await fetchAuth(`${API_BASE}/patients`);
        setPatients(patientsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add new visit
  const handleAddVisit = async (e) => {
    e.preventDefault();
    try {
      const addedVisit = await fetchAuth(`${API_BASE}/visits`, {
        method: 'POST',
        body: JSON.stringify(newVisit)
      });

      // Refresh visits list
      const updatedVisits = await fetchAuth(`${API_BASE}/visits`);
      setVisits(updatedVisits);

      // Reset form and close modal
      setNewVisit({
        patient_id: '',
        diagnosis: '',
        doctor_id: 1
      });
      setShowAddModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading visits...</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Visits</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add New Visit
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {visits.length === 0 ? (
        <Alert variant="info">No visits recorded</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {visits.map((visit) => (
            <Col key={visit.visit_id}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    Patient ID: {visit.patient_id}
                  </Card.Title>
                  <Card.Text>
                    <strong>Date:</strong> {new Date(visit.visit_date).toLocaleDateString()}
                    <br />
                    <strong>Diagnosis:</strong> {visit.diagnosis}
                    <br />
                    <strong>Doctor:</strong> {visit.doctor}
                  </Card.Text>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => navigate(`/patients/${visit.patient_id}`)}
                  >
                    View Patient Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add Visit Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Visit</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddVisit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Form.Select
                value={newVisit.patient_id}
                onChange={(e) => setNewVisit({
                  ...newVisit, 
                  patient_id: Number(e.target.value)
                })}
                required
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option 
                    key={patient.id} 
                    value={patient.id}
                  >
                    {patient.name} (ID: {patient.id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Diagnosis</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newVisit.diagnosis}
                onChange={(e) => setNewVisit({
                  ...newVisit, 
                  diagnosis: e.target.value
                })}
                required
                placeholder="Enter visit diagnosis"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Visit
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

// Prescriptions Page
function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [newPrescription, setNewPrescription] = useState({
    patient_id: '',
    drug_name: '',
    dosage: '',
    duration: '',
    doctor_id: 1 // Default doctor, adjust as needed
  });

  // Fetch prescriptions and patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch prescriptions
        const prescriptionsData = await fetchAuth(`${API_BASE}/prescriptions`);
        setPrescriptions(prescriptionsData);

        // Fetch patients for dropdown
        const patientsData = await fetchAuth(`${API_BASE}/patients`);
        setPatients(patientsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add new prescription
  const handleAddPrescription = async (e) => {
    e.preventDefault();
    try {
      const addedPrescription = await fetchAuth(`${API_BASE}/prescriptions`, {
        method: 'POST',
        body: JSON.stringify(newPrescription)
      });

      // Refresh prescriptions list
      const updatedPrescriptions = await fetchAuth(`${API_BASE}/prescriptions`);
      setPrescriptions(updatedPrescriptions);

      // Reset form and close modal
      setNewPrescription({
        patient_id: '',
        drug_name: '',
        dosage: '',
        duration: '',
        doctor_id: 1
      });
      setShowAddModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading prescriptions...</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Prescriptions</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add New Prescription
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {prescriptions.length === 0 ? (
        <Alert variant="info">No prescriptions recorded</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {prescriptions.map((prescription) => (
            <Col key={prescription.prescription_id}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    Patient ID: {prescription.patient_id}
                  </Card.Title>
                  <Card.Text>
                    <strong>Drug:</strong> {prescription.drug_name}
                    <br />
                    <strong>Dosage:</strong> {prescription.dosage}
                    <br />
                    <strong>Duration:</strong> {prescription.duration}
                    <br />
                    <strong>Doctor:</strong> {prescription.doctor}
                    <br />
                    <strong>Date:</strong> {new Date(prescription.visit_date).toLocaleDateString()}
                  </Card.Text>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => navigate(`/patients/${prescription.patient_id}`)}
                  >
                    View Patient Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add Prescription Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Prescription</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddPrescription}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Form.Select
                value={newPrescription.patient_id}
                onChange={(e) => setNewPrescription({
                  ...newPrescription, 
                  patient_id: Number(e.target.value)
                })}
                required
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option 
                    key={patient.id} 
                    value={patient.id}
                  >
                    {patient.name} (ID: {patient.id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Drug Name</Form.Label>
              <Form.Control
                type="text"
                value={newPrescription.drug_name}
                onChange={(e) => setNewPrescription({
                  ...newPrescription, 
                  drug_name: e.target.value
                })}
                required
                placeholder="Enter drug name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dosage</Form.Label>
              <Form.Control
                type="text"
                value={newPrescription.dosage}
                onChange={(e) => setNewPrescription({
                  ...newPrescription, 
                  dosage: e.target.value
                })}
                required
                placeholder="Enter dosage"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Duration</Form.Label>
              <Form.Control
                type="text"
                value={newPrescription.duration}
                onChange={(e) => setNewPrescription({
                  ...newPrescription, 
                  duration: e.target.value
                })}
                required
                placeholder="Enter duration"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Prescription
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
// Reports Page
function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [newReport, setNewReport] = useState({
    patient_id: '',
    report_type: '',
    report_data: ''
  });

  // Fetch reports and patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch reports
        const reportsData = await fetchAuth(`${API_BASE}/reports`);
        setReports(reportsData);

        // Fetch patients for dropdown
        const patientsData = await fetchAuth(`${API_BASE}/patients`);
        setPatients(patientsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add new report
  const handleAddReport = async (e) => {
    e.preventDefault();
    try {
      await fetchAuth(`${API_BASE}/reports`, {
        method: 'POST',
        body: JSON.stringify(newReport)
      });

      // Refresh reports list
      const updatedReports = await fetchAuth(`${API_BASE}/reports`);
      setReports(updatedReports);

      // Reset form and close modal
      setNewReport({
        patient_id: '',
        report_type: '',
        report_data: ''
      });
      setShowAddModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading reports...</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Medical Reports</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add New Report
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {reports.length === 0 ? (
        <Alert variant="info">No reports recorded</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {reports.map((report) => (
            <Col key={report.report_id}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    Patient ID: {report.patient_id}
                  </Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {report.report_type}
                  </Card.Subtitle>
                  <Card.Text>
                    {report.report_data}
                    <br />
                    <small className="text-muted">
                      Created: {new Date(report.created_at).toLocaleString()}
                    </small>
                  </Card.Text>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => navigate(`/patients/${report.patient_id}`)}
                  >
                    View Patient Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add Report Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Medical Report</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddReport}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Form.Select
                value={newReport.patient_id}
                onChange={(e) => setNewReport({
                  ...newReport, 
                  patient_id: Number(e.target.value)
                })}
                required
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option 
                    key={patient.id} 
                    value={patient.id}
                  >
                    {patient.name} (ID: {patient.id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Report Type</Form.Label>
              <Form.Select
                value={newReport.report_type}
                onChange={(e) => setNewReport({
                  ...newReport, 
                  report_type: e.target.value
                })}
                required
              >
                <option value="">Select Report Type</option>
                <option value="Lab Test">Lab Test</option>
                <option value="Radiology">Radiology</option>
                <option value="Blood Work">Blood Work</option>
                <option value="Physical Examination">Physical Examination</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Report Details</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={newReport.report_data}
                onChange={(e) => setNewReport({
                  ...newReport, 
                  report_data: e.target.value
                })}
                required
                placeholder="Enter detailed report information"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Report
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <MainNavbar 
        isAuthenticated={isAuthenticated} 
        onLogout={handleLogout} 
      />
      
      <Routes>
        <Route 
          path="/login" 
          element={<Login onLogin={handleLogin} />} 
        />
        
        <Route 
          path="/patients" 
          element={isAuthenticated ? <PatientsList /> : <Login onLogin={handleLogin} />} 
        />
        
        <Route 
          path="/patients/:id" 
          element={isAuthenticated ? <PatientDetails /> : <Login onLogin={handleLogin} />} 
        />
        
        <Route 
          path="/visits" 
          element={isAuthenticated ? <VisitsPage /> : <Login onLogin={handleLogin} />} 
        />
        
        <Route 
          path="/prescriptions" 
          element={isAuthenticated ? <PrescriptionsPage /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/reports" 
          element={isAuthenticated ? <ReportsPage /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Container className="mt-4">
                <h1>Welcome to Patient Record Management System</h1>
                <Row>
                  <Col>
                    <Card>
                      <Card.Body>
                        <Card.Title>Patients</Card.Title>
                        <Card.Text>
                          Manage patient records and information
                        </Card.Text>
                        <Button variant="primary" as={Link} to="/patients">
                          View Patients
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card>
                      <Card.Body>
                        <Card.Title>Visits</Card.Title>
                        <Card.Text>
                          View and manage patient visits
                                        </Card.Text>
                        <Button variant="primary" as={Link} to="/visits">
                          View Visits
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card>
                      <Card.Body>
                        <Card.Title>Prescriptions</Card.Title>
                        <Card.Text>
                          Manage patient prescriptions
                        </Card.Text>
                        <Button variant="primary" as={Link} to="/prescriptions">
                          View Prescriptions
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col>
                    <Card>
                      <Card.Body>
                        <Card.Title>Reports</Card.Title>
                        <Card.Text>
                          View and manage medical reports
                        </Card.Text>
                        <Button variant="primary" as={Link} to="/reports">
                          View Reports
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Container>
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;