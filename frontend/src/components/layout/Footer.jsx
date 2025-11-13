import React from "react";
import { TbHexagonLetterV } from "react-icons/tb";

const Footer = ({ isOpen }) => (
  // --- NEW: Glassmorphic background with neon border ---
  <footer
    className={`w-full fixed bottom-0 z-30 transition-all duration-300 ${
      isOpen ? "ml-64" : "ml-0"
    } 
    bg-gray-950/80 backdrop-blur-lg border-t border-blue-500/30 
    text-center py-4`}
  >
    <div className="flex items-center justify-center gap-2">
      <TbHexagonLetterV className="text-lg text-cyan-300" />
      <p className="text-sm text-gray-400">
        © {new Date().getFullYear()}{" "}
        {/* --- NEW: Styled with Cyber Pink/Blue Gradient --- */}
        <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">
          VITALIS
        </span>
        . All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;