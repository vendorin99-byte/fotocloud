// eslint-disable-next-line @typescript-eslint/no-require-imports
const midtransClient = require("midtrans-client");

export const PRO_PLANS = {
  monthly: {
    label: "Pro Bulanan",
    amount: 99_000,
    days: 30,
    description: "Akses Pro 30 hari",
  },
  yearly: {
    label: "Pro Tahunan",
    amount: 899_000,
    days: 365,
    description: "Akses Pro 365 hari (hemat 25%)",
  },
} as const;

export type PlanKey = keyof typeof PRO_PLANS;

function getSnap() {
  return new midtransClient.Snap({
    isProduction: process.env.NODE_ENV === "production",
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
}

export async function createSnapToken({
  orderId,
  amount,
  customerName,
  customerEmail,
  itemName,
}: {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  itemName: string;
}): Promise<string> {
  const snap = getSnap();
  const parameter = {
    transaction_details: { order_id: orderId, gross_amount: amount },
    credit_card: { secure: true },
    customer_details: { first_name: customerName, email: customerEmail },
    item_details: [{ id: "pro", price: amount, quantity: 1, name: itemName }],
  };
  const transaction = await snap.createTransaction(parameter);
  return transaction.token;
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const crypto = require("crypto");
  const serverKey = process.env.MIDTRANS_SERVER_KEY ?? "";
  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");
  return hash === signatureKey;
}
