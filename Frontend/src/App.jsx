import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import RoomsList from "./pages/RoomsList";
import AddRoom from "./pages/AddRoom";
import Profile from "./pages/Profile";
import RoomDetails from "./pages/RoomDetails";
import BookingPage from "./pages/BookingPage";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<RoomsList />} />
        <Route path="/add-room" element={<AddRoom />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/booking" element={<BookingPage />} />
      </Routes>
    </Router>
  );
}
