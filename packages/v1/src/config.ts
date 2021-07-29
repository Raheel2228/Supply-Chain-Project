const config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
  audience: process.env.REACT_APP_AUTH0_AUDIENCE,
  apiBase:
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080"
      : process.env.REACT_APP_API_BASE,
  copyrightNotice: "© 2020 Izba",
  contactUrl: "https://www.izba.co/",
  privacyUrl: "https://www.izba.co/",
  appName: "Capabl",
  // Enable/disable SpreadJS support if deployed to prod
  enableSpread:
    process.env.NODE_ENV === "development" ||
    !process.env.REACT_APP_API_BASE?.includes("dev"),
  spreadJSKey:
    "www.capabl.co,911862974919293#B0ZlNQkxkMxQlUMtyYzYkM596M83UckdEOOZ7ahFFawIHRiNXc7I5SkZWeUtGVjVVRypXRykUc45UZ4pHbrRTe49GVElkaysEVYR5TOpUR72kbPZ6Y4o6TrEmavsUN9FHS7V7L7w4cUdFchZ5aENGNzwGUid7VSZ4L8JVN4sEW5l7NXtSa8p6S9l5d8k4dll5cPFVRId7MvhXTRRzTz5WVax4NxQDdBNERzVDbnB7QYlFaYR4TVF6RIBDVa3Sc9IDd4QHM0FnTkFWUlBjbDdmYIF5a0VUWWRWR7A5VGpUTsV5NDZTamlHViojITJCLiIjN9UDMEJjMiojIIJCL4QDNzMjM5QzN0IicfJye#4Xfd5nIFVUSWJiOiMkIsICNx8idgAyUKBCZhVmcwNlI0IiTis7W0ICZyBlIsIiNyIDN4ADIyEjMxAjMwIjI0ICdyNkIsIybj9CbiFGchNmL7d7diojIz5GRiwiIhJmeJJiOiEmTDJCLiMTOykTM9QzN9IjN8ETM9IiOiQWSiwSflNHbhZmOiI7ckJye0ICbuFkI1pjIEJCLi4TPBdkNy2EOwQ6ThRGVOt4YwlkUKNUOwonQNhzRrU7dOZWSLFnM9IFO5UFVzUTers4T7p7Q0pGd0ZHNXNVeI9UeSFXbWdnMI94TqlUO4sCMWh5T9sCeDVWcyxmaZZ6ZEBDWvVET42mZQJWU7ZDRwR5d",
  spreadJSDesignerKey:
    "www.capabl.co,589587868455746#B0gSwFUT7MGMSZVREp6Q4MzRuNjUSp6cBdUMNRFRUNkcDdDOVBFV6EGURV7cjVVMvFUSDdmWLFnVEhFRtZjQvhDVNB5UxE5QXlDWFpFWlJzNLhWRVdVTGhVeDVzS0pEVlJFZzhFbRJWNHVmcmpUTDFXWRFUdVZzMx8mYsRHc6IWWV3WU9gHerM6d5k7aPFUUFJjcKtCdrIDVw3WU8AHc6NzNatGTLRWb7MFU5MWTyZ4cBVEbal6S93EUMlVc5l5RGBDOpRTbiN5NjR6Qh9WY8JkQvI4SPBzbxVjahdFWrgGe79WOhJiOiMlIsISOyAjRzETNiojIIJCLzcjM9MTM9cjM0IicfJye35XX3JSW6U4NiojIDJCLiQTMuYHIu3GZkFULyVmbnl6clRULTpEZhVmcwNlI0IiTis7W0ICZyBlIsIiN5QDN4ADIyEjMxAjMwIjI0ICdyNkIsIybj9CbiFGchNmL7d7diojIz5GRiwiIhJmeJJiOiEmTDJCLiYDN7UTN4gjN8cDO5kDO5IiOiQWSisnOiQkIsISP3EFOThzV6VWR6xWTyMWYrkzQ6NmRpNTN73WMZd7LZhHZEZ7YRp5NaZjW82kYvQjcGlEUoJGVhtmTIBjbyJ6dKF6NHF6Ni5UWDNlQldlewB7a6oWM4MjdrVjeUl7MvNkeNN5brUUTuN6aXl4VphDO7I6V5M",
};

export default config;
