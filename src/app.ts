import initApp from "./server";

const getBaseUrl = (port: number): string => {
  if (process.env.DOMAIN_BASE) {
    // אם DOMAIN_BASE מוגדר, השתמש בו
    return process.env.DOMAIN_BASE.endsWith("/")
      ? process.env.DOMAIN_BASE
      : `${process.env.DOMAIN_BASE}/`;
  } else if (process.env.NODE_ENV === "production") {
    // בסביבת ייצור, השתמש בכתובת ברירת מחדל אם DOMAIN_BASE לא מוגדר
    return "http://node47.cs.colman.ac.il/";
  } else {
    // בסביבת פיתוח, השתמש ב-localhost (אם DOMAIN_BASE לא מוגדר)
    return `http://localhost:${port}`;
  }
};

initApp().then((app) => {
  const port = parseInt(process.env.PORT || "3000"); // פורט ברירת מחדל
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

// דוגמה לשימוש:
const port = parseInt(process.env.PORT || "3000"); // פורט ברירת מחדל
const baseUrl = getBaseUrl(port);
console.log(`Base URL: ${baseUrl}`);

// דוגמה לשינוי URL:
// const myUrl = `${baseUrl}your/endpoint`; // שנה את "your/endpoint" לכתובת ה-endpoint שלך
// console.log(`My URL: ${myUrl}`);