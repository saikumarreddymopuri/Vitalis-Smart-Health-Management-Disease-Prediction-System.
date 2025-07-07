// src/components/Layout/Footer.jsx
import React from "react";

const Footer = ({ isOpen }) => (
  <footer
    className={`w-full fixed bottom-0 z-30 ${
      isOpen ? "md:ml-64" : ""
    } bg-white dark:bg-gray-900 border-t dark:border-gray-700 text-center py-4 transition-all duration-300`}
  >
    <p className="text-sm text-gray-600 dark:text-gray-400">
      © {new Date().getFullYear()} <span className="font-semibold text-blue-600 dark:text-blue-400">MediConnect</span>. All rights reserved.
    </p>
  </footer>
);

export default Footer;
