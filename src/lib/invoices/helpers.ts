export function generateInvoiceNo(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);

  return `FAT-${year}${month}-${random}`;
}
