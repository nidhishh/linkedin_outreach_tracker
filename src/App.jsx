import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ContactsProvider } from "./lib/ContactsContext";
import Sidebar from "./components/Sidebar";
import ContactFormModal from "./components/ContactFormModal";
import BackupModal from "./components/BackupModal";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Contacts from "./pages/Contacts";
import ContactDetail from "./pages/ContactDetail";

export default function App() {
  const [addOpen, setAddOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);

  return (
    <ContactsProvider>
      <HashRouter>
        <div className="flex min-h-screen">
          <Sidebar
            onAddContact={() => setAddOpen(true)}
            onBackup={() => setBackupOpen(true)}
          />
          <main className="flex-1 px-10 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/contacts/:id" element={<ContactDetail />} />
            </Routes>
          </main>
        </div>
        <ContactFormModal open={addOpen} onClose={() => setAddOpen(false)} />
        <BackupModal open={backupOpen} onClose={() => setBackupOpen(false)} />
      </HashRouter>
    </ContactsProvider>
  );
}
