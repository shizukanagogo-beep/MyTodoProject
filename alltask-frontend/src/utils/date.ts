export const getLocalDateString = (offsetDays = 0) => {
  const dateValue = new Date();
  dateValue.setDate(dateValue.getDate() + offsetDays);

  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const date = String(dateValue.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
};
