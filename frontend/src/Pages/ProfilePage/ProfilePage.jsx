import React from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProfileForm from "./components/ProfileForm";
import Footer from "./components/Footer";

export default function ProfilePage() {
  return (
    <div className="bg-primary font-outfit min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-col lg:flex-row gap-8 mx-4 md:mx-8 lg:mx-20 mt-12 mb-20 flex-grow">
        <Sidebar />
        <main className="flex-1 max-w-4xl bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-12">
            Your Profile
          </h1>
          <ProfileForm />
        </main>
      </div>

      <Footer />
    </div>
  );
}
