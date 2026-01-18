import initApp from "./server";

/**
 * Determines the base URL based on environment configuration
 * 
 * @param port - The port number for the server
 * @returns The base URL string
 */
const getBaseUrl = (port: number): string => {
  if (process.env.DOMAIN_BASE) {
    // If DOMAIN_BASE is defined, use it
    return process.env.DOMAIN_BASE.endsWith("/")
      ? process.env.DOMAIN_BASE
      : `${process.env.DOMAIN_BASE}/`;
  } else if (process.env.NODE_ENV === "production") {
    // In production environment, use default address if DOMAIN_BASE is not defined
    return "http://node47.cs.colman.ac.il/";
  } else {
    // In development environment, use localhost (if DOMAIN_BASE is not defined)
    return `http://localhost:${port}`;
  }
};

/**
 * Initialize and start the Express application
 */
initApp().then((app) => {
  const port = parseInt(process.env.PORT || "3000"); // Default port
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

// Usage example:
const port = parseInt(process.env.PORT || "3000"); // Default port
const baseUrl = getBaseUrl(port);
console.log(`Base URL: ${baseUrl}`);

// Example for URL modification:
// const myUrl = `${baseUrl}your/endpoint`; // Change "your/endpoint" to your actual endpoint address
// console.log(`My URL: ${myUrl}`);