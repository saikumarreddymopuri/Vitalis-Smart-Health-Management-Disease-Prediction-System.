import React, { useState } from "react";
import Header from "../components/Layout/Header.jsx";
import Sidebar from "../components/Layout/Sidebar.jsx";
import Footer from "../components/Layout/Footer.jsx";
import { useEffect } from "react";

const UserDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [activeTab, setActiveTab] = useState(""); // to track which section is active
  const [inputSymptom, setInputSymptom] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);


  //history of predictions 
  const [history, setHistory] = useState([]);

  const [userLocation, setUserLocation] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);

  // 🆕 At top of UserDashboard.jsx (with other useState imports)
  //const [activeTab, setActiveTab] = useState("predict"); // or your default
  //const [activeTab, setActiveTab] = useState("bookBed");
  const [showBookingForm, setShowBookingForm] = useState(false); // 🆕 Controls form visibility
  const [selectedBookingInfo, setSelectedBookingInfo] = useState(null); // 🆕 Info from dashboard card
  const [bedType, setBedType] = useState("");
  const [bedsCount, setBedsCount] = useState(1);
  const [userBookings, setUserBookings] = useState([]);





useEffect(() => {
  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ No token found. Cannot fetch history.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/symptoms", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("📜 Prediction history response:", data);
      setHistory(data.data); // ✅ store array of predictions
    } catch (err) {
      console.error("❌ Failed to fetch prediction history:", err);
    }
  };

  if (activeTab === "history") {
    fetchHistory(); // ✅ only fetch when "history" tab is active
  }
}, [activeTab]);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:4000/api/bookings/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setUserBookings(data.data || []);
      }
    } catch (err) {
      console.error("❌ Failed to load bookings", err);
    }
  };

  useEffect(() => {
  if (activeTab === "bookBed") {
    if (!selectedBookingInfo) {
      // User came directly through sidebar — show only past bookings
      setShowBookingForm(false);
      fetchUserBookings(); // Function that fetches from GET /api/bookings/user
    }
  }
}, [activeTab]);









  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header
        toggleSidebar={() => setIsOpen(!isOpen)}
        avatarUrl={user.avatar}
        name={user.fullName}
      />
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen(!isOpen)}
        setActiveTab={setActiveTab}
        role={user.role}
      />

      <main className="ml-0 md:ml-64 p-6 flex-grow">
        {activeTab === "" && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <img
              src={user.avatar}
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg mb-4"
            />
            <h1 className="text-3xl font-bold text-blue-700 mb-2">
              Welcome to MediConnect 👋
            </h1>
            <p className="text-gray-600">We’re glad to have you on board!</p>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold">Your Profile</h2>
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}

        {activeTab === "know" && (
  <div className="bg-white p-6 rounded shadow">
    <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">Know The Disease</h2>

    {/* Symptom Selection UI */}
    <div className="flex items-center gap-3 mb-4">
      <select
        className="p-2 border rounded w-full"
        value={inputSymptom}
        onChange={(e) => setInputSymptom(e.target.value)}
      >
        <option value="">-- Select a symptom --</option>
        {[
          "abdominal_pain", "abnormal_menstruation", "acidity", "acute_liver_failure", "altered_sensorium",
          "anxiety", "back_pain", "belly_pain", "blackheads", "bladder_discomfort", "blister", "blood_in_sputum",
          "bloody_stool", "blurred_and_distorted_vision", "breathlessness", "brittle_nails", "bruising",
          "burning_micturition", "chest_pain", "chills", "cold_hands_and_feets", "coma", "congestion",
          "constipation", "continuous_feel_of_urine", "continuous_sneezing", "cough", "cramps", "dark_urine",
          "dehydration", "depression", "diarrhoea", "dischromic _patches", "distention_of_abdomen", "dizziness",
          "drying_and_tingling_lips", "enlarged_thyroid", "excessive_hunger", "extra_marital_contacts",
          "family_history", "fast_heart_rate", "fatigue", "fluid_overload", "foul_smell_of urine", "headache",
          "high_fever", "hip_joint_pain", "history_of_alcohol_consumption", "increased_appetite", "indigestion",
          "inflammatory_nails", "internal_itching", "irregular_sugar_level", "irritability", "irritation_in_anus",
          "itching", "joint_pain", "knee_pain", "lack_of_concentration", "lethargy", "loss_of_appetite",
          "loss_of_balance", "loss_of_smell", "malaise", "mild_fever", "mood_swings", "movement_stiffness",
          "mucoid_sputum", "muscle_pain", "muscle_wasting", "muscle_weakness", "nausea", "neck_pain",
          "nodal_skin_eruptions", "obesity", "pain_behind_the_eyes", "pain_during_bowel_movements",
          "pain_in_anal_region", "painful_walking", "palpitations", "passage_of_gases", "patches_in_throat",
          "phlegm", "polyuria", "prominent_veins_on_calf", "puffy_face_and_eyes", "pus_filled_pimples",
          "receiving_blood_transfusion", "receiving_unsterile_injections", "red_sore_around_nose",
          "red_spots_over_body", "redness_of_eyes", "restlessness", "runny_nose", "rusty_sputum", "scurring",
          "shivering", "silver_like_dusting", "sinus_pressure", "skin_peeling", "skin_rash", "slurred_speech",
          "small_dents_in_nails", "spinning_movements", "spotting_ urination", "stiff_neck", "stomach_bleeding",
          "stomach_pain", "sunken_eyes", "sweating", "swelled_lymph_nodes", "swelling_joints",
          "swelling_of_stomach", "swollen_blood_vessels", "swollen_extremeties", "swollen_legs",
          "throat_irritation", "toxic_look_(typhos)", "ulcers_on_tongue", "unsteadiness", "visual_disturbances",
          "vomiting", "watering_from_eyes", "weakness_in_limbs", "weakness_of_one_body_side", "weight_gain",
          "weight_loss", "yellow_crust_ooze", "yellow_urine", "yellowing_of_eyes", "yellowish_skin"
        ].map((symptom) => (
          <option key={symptom} value={symptom}>{symptom}</option>
        ))}
      </select>
      <button
        onClick={() => {
          if (inputSymptom && !selectedSymptoms.includes(inputSymptom)) {
            setSelectedSymptoms([...selectedSymptoms, inputSymptom]);
            setInputSymptom("");
          }
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer"
        title="Add symptom"
      >
        ➕
      </button>
    </div>

    {/* Display selected symptoms */}
    {selectedSymptoms.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedSymptoms.map((symptom, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
          >
            {symptom}
          </span>
        ))}
      </div>
    )}

    {/* Predict button */}
    
<button
  onClick={async () => {
    if (selectedSymptoms.length < 2) {
      alert("Please select at least 2 symptoms.");
      return;
    }

    setLoading(true); // Start loading

    try {
      // Call Python API
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
      });

      const data = await res.json();
      console.log("🔍 Prediction result:", data);
      setPrediction(data.predicted_disease);


      // Get user location

      navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        try {
          // Log token for debugging
          const token = localStorage.getItem("token");
          console.log("🧪 Token used:", token);
          if (!token) {
            console.error("❌ No token found in localStorage!");
            return;
          }

          const res = await fetch(
    `http://localhost:4000/api/hospitals/nearby-by-disease?disease=${data.predicted_disease}&userLat=${latitude}&userLng=${longitude}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
          const hospData = await res.json();
          setNearbyHospitals(hospData.data || []);
          console.log("📍 Nearby Hospitals:", hospData.data);
        } catch (err) {
          console.error("❌ Error fetching hospitals:", err);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Please allow location access to find nearby hospitals.");
      }
    );


      // Save to backend
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("⚠️ No token found. Cannot save prediction.");
        return;
      }

      const saveRes = await fetch("http://localhost:4000/api/symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symptom_list: selectedSymptoms,
          predicted_disease: data.predicted_disease,
        }),
      });

      const saveData = await saveRes.json();
      console.log("✅ Prediction saved:", saveData);
    } catch (err) {
      console.error("❌ Error in prediction or saving:", err);
    } finally {
      setLoading(false); // End loading
    }
  }}
  className={`bg-green-600 text-white px-6 py-2 rounded transition ${
    loading || selectedSymptoms.length < 2
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-green-700"
  }`}
  disabled={loading || selectedSymptoms.length < 2}
>
  {loading ? "🔄 Predicting..." : "🔍 Predict Disease"}
</button>



    {/* Show prediction result */}
    {prediction && (
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-blue-700">🩺 Predicted Disease:</h3>
        <p className="text-xl font-bold mt-2 text-green-700">{prediction}</p>
      </div>
    )}


{/*Show nearby hospitals if prediction is made*/}

    {nearbyHospitals.length > 0 && (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">🏥 Nearby Hospitals:</h3>
        <ul className="space-y-3">
          {nearbyHospitals.map((hosp) => (
            <li
              key={hosp._id}
              className="p-4 border rounded shadow-sm bg-gray-50"
            >
              <p className="font-bold text-gray-800">{hosp.name}</p>
              <p className="text-sm text-gray-600">
                {hosp.specialization_offered} • {hosp.distance} km away
              </p>
              <div className="flex gap-3 mt-2">
                <button className="px-3 py-1 bg-blue-500 text-white rounded">View Route</button>
                <button
                    onClick={() => {
                      setSelectedBookingInfo({
                        hospitalId: hosp._id,
                        hospitalName: hosp.name,
                        disease: prediction,
                      });
                      setShowBookingForm(true);
                      setActiveTab("bookBed"); // 🔁 redirect to booking form tab
                    }}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition text-sm"
                  >
                    🛏️ Book Bed
                  </button>


                <button className="px-3 py-1 bg-purple-600 text-white rounded">Book Ambulance</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )}


    

  </div>
)}


        {activeTab === "bookBed" && (
            <div className="p-6 bg-white rounded shadow">
              {showBookingForm ? (
                <>
                  <h2 className="text-xl font-bold mb-4">📝 Book a Bed at {selectedBookingInfo?.hospitalName}</h2>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const token = localStorage.getItem("token");

                      const res = await fetch("http://localhost:4000/api/bookings", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          hospitalId: selectedBookingInfo.hospitalId,
                          bed_type: bedType,
                          disease: selectedBookingInfo.disease,
                          bedsCount: parseInt(bedsCount) || 1, // Ensure it's a number
                        }),
                      });

                      const data = await res.json();
                      if (res.ok) {
                        alert("✅ Booking request submitted");
                        await fetchUserBookings();
                        setShowBookingForm(false); // Hide form
                        setSelectedBookingInfo(null); // Clear info
                      } else {
                        alert(data.message || "Booking failed");
                      }
                    }}
                    className="space-y-4"
                  >
                    {/* Bed Type */}
                    <select
                      className="w-full border p-2 rounded"
                      value={bedType}
                      onChange={(e) => setBedType(e.target.value)}
                      required
                    >
                      <option value="">Select Bed Type</option>
                      <option value="general">General</option>
                      <option value="icu">ICU</option>
                      <option value="ventilator">Ventilator</option>
                      <option value="deluxe">Deluxe</option>
                    </select>

                    {/* Number of Beds */}
                    <input
                      type="number"
                      className="w-full border p-2 rounded"
                      value={bedsCount}
                      onChange={(e) => setBedsCount(e.target.value)}
                      placeholder="Number of Beds"
                      min={1}
                      required
                    />

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                      >
                        ✅ Confirm Booking
                      </button>

                      <button
                        type="button"
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                        onClick={() => {
                          setShowBookingForm(false);
                          setSelectedBookingInfo(null);
                        }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4">📄 Your Past Bed Bookings</h2>
                  {userBookings.length === 0 ? (
                    <p>No past bookings yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {userBookings.map((booking) => (
                        <li
                          key={booking._id}
                          className="border p-3 rounded bg-gray-50 shadow-sm"
                        >
                          <p><strong>🏥 Hospital:</strong> {booking.hospital.name}</p>
                          <p><strong>🛏️ Bed:</strong> {booking.bed_type}</p>
                          <p><strong>🦠 Disease:</strong> {booking.disease}</p>
                          <p><strong>Status:</strong> 
                            <span className={`ml-1 font-semibold ${booking.status === "confirmed" ? "text-green-600" : booking.status === "pending" ? "text-yellow-600" : "text-red-600"}`}>
                              {booking.status}
                            </span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}



        {activeTab === "transport" && (
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-xl font-bold mb-4">Transport Booking</h2>
            <p>🚑 Transport booking coming soon...</p>
          </div>
        )}

              {activeTab === "history" && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Your History</h2>

          {history.length === 0 ? (
            <p>No previous predictions found.</p>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item._id}
                  className="border border-gray-300 rounded p-4 bg-gray-50 shadow-sm"
                >
                  <p className="text-sm text-gray-600">
                    <strong>🕒 Date:</strong>{" "}
                    {new Date(item.predictionDate).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>🤒 Symptoms:</strong>{" "}
                    {item.symptomList.join(", ")}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>🧠 Predicted Disease:</strong>{" "}
                    <span className="font-semibold text-green-600">
                      {item.predictedDisease}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
