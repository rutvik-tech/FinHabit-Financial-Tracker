/**
 * Utility to generate and trigger a CSV file download in the browser.
 * Properly escapes commas, quotes, and newlines per RFC 4180.
 *
 * @param {Array<Object>} data - Array of data objects
 * @param {Array<{ key: string, label: string }>} columns - Column definitions
 * @param {string} filename - Desired filename without extension
 */
export const exportToCSV = (data, columns, filename = "finhabit-export") => {
  if (!data || data.length === 0) {
    throw new Error("No data available to export.");
  }

  // 1. Build Header Row
  const headers = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(",");

  // 2. Build Data Rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let value = item[col.key];

        if (value === undefined || value === null) {
          value = "";
        } else if (value instanceof Date || (typeof value === "string" && !isNaN(Date.parse(value)) && col.key.toLowerCase().includes("date"))) {
          const d = new Date(value);
          value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        } else {
          value = String(value);
        }

        // Escape double quotes by doubling them
        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  const dateSuffix = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${dateSuffix}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};