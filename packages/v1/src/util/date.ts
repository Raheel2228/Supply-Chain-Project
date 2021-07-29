/**
 * Consistently format timestamps for use throughout the app.
 * @param date date to be formatted
 * @returns string of format “July 2, 2020, 10:48 PM”
 */
export const formatTimestamp = (date: Date | string): string => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const options = {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};
