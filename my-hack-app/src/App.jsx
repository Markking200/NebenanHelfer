import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import Features from './components/Features/Features';
import HowItWorks from './components/HowItWorks/HowItWorks';
import TrustSection from './components/TrustSection/TrustSection';
import Footer from './components/Footer/Footer';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentRegistration from './components/StudentRegistration/StudentRegistration';
import SeniorRegistration from './components/SeniorRegistration/SeniorRegistration';
import SignIn from './components/SignIn/SignIn';
import StudentDashboard from './components/StudentDashboard/StudentDashboard';
import SeniorDashboard from './components/SeniorDashboard/SeniorDashboard';

import { AuthProvider } from './context/AuthContext';

import MyTasks from './components/MyTasks/MyTasks';



import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              {/* Home route with all components */}
              <Route path="/" element={
                <>
                  <Hero />
                  <HowItWorks />
                  <TrustSection />
                  <Features />
                </>
              } />
              {/* Registration routes */}
              <Route path="/join/student" element={<StudentRegistration />} />
              <Route path="/join/senior" element={<SeniorRegistration />} />
              {/* Sign In route */}
              <Route path="/signin" element={<SignIn />} />
              {/* Student Dashboard */}
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/my-tasks" element={<MyTasks />} />
              <Route path="/senior-dashboard" element={<SeniorDashboard />} />


            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;