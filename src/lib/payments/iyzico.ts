import type { PlanType } from "@/types/index";

interface IyzipayCheckoutCreateResponse {
  status: "success" | "failure";
  errorCode?: string;
  errorMessage?: string;
  conversationId?: string;
  paymentPageUrl?: string;
  token?: string;
  checkoutFormContent?: string;
}

interface CreateCheckoutParams {
  plan: PlanType;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  callbackUrl: string;
}

export function isIyzicoConfigured(): boolean {
  return Boolean(
    process.env.IYZICO_API_KEY &&
      process.env.IYZICO_SECRET_KEY &&
      process.env.IYZICO_BASE_URL
  );
}

export async function createIyzicoCheckout(
  params: CreateCheckoutParams
): Promise<{
  checkoutUrl: string;
  token: string;
  paymentPageUrl?: string;
}> {
  const { plan, userId, userEmail, userName, userPhone, callbackUrl } = params;

  const priceMap: Record<PlanType, number> = {
    free: 0,
    esnaf: 99,
    usta: 199,
  };

  const price = priceMap[plan];
  const conversationId = crypto.randomUUID();

  const payload = {
    locale: "tr",
    conversationId,
    price: String(price),
    paidPrice: String(price),
    currency: "TRY",
    basketId: crypto.randomUUID(),
    paymentChannel: "WEB",
    paymentGroup: "SUBSCRIPTION",
    enabledInstallments: "1",
    paymentSource: "TahsilatCI",
    buyer: {
      id: userId,
      name: userName.split(" ")[0] || userName,
      surname: userName.split(" ")[1] || userName,
      email: userEmail,
      gsmNumber: userPhone.replace(/\D/g, ""),
      identityNumber: "11111111111",
      registrationAddress: "TahsilatCI",
      ip: "127.0.0.1",
      city: "Istanbul",
      country: "Turkey",
    },
    shippingAddress: {
      contactName: userName,
      city: "Istanbul",
      country: "Turkey",
      address: "TahsilatCI",
    },
    billingAddress: {
      contactName: userName,
      city: "Istanbul",
      country: "Turkey",
      address: "TahsilatCI",
    },
    callbackUrl,
  };

  const baseUrl = process.env.IYZICO_BASE_URL!;
  const apiKey = process.env.IYZICO_API_KEY!;
  const secretKey = process.env.IYZICO_SECRET_KEY!;

  const authHeader = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

  const response = await fetch(`${baseUrl}/payment/iyzipos/checkoutform/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`iyzico request failed: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as IyzipayCheckoutCreateResponse;

  if (data.status === "failure") {
    throw new Error(
      `iyzico checkout failed: ${data.errorCode} - ${data.errorMessage}`
    );
  }

  if (!data.token || !data.checkoutFormContent) {
    throw new Error("iyzico returned no token or checkout form content");
  }

  return {
    checkoutUrl:
      data.paymentPageUrl ||
      `${baseUrl}/payment/iyzipos/checkoutform/${data.token}`,
    token: data.token,
    paymentPageUrl: data.paymentPageUrl,
  };
}

export async function retrieveIyzicoCheckoutResult(token: string): Promise<{
  status: string;
  paymentId?: string;
  errorCode?: string;
  errorMessage?: string;
}> {
  const baseUrl = process.env.IYZICO_BASE_URL!;
  const apiKey = process.env.IYZICO_API_KEY!;
  const secretKey = process.env.IYZICO_SECRET_KEY!;

  const authHeader = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

  const payload = {
    locale: "tr",
    conversationId: crypto.randomUUID(),
    token,
  };

  const response = await fetch(
    `${baseUrl}/payment/iyzipos/checkoutform/detail`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`iyzico detail request failed: ${response.status}`);
  }

  const data = (await response.json()) as IyzipayCheckoutCreateResponse & {
    paymentId?: string;
    itemTransactions?: Array<{ paymentId?: string }>;
  };

  return {
    status: data.status,
    paymentId:
      data.paymentId ||
      data.itemTransactions?.[0]?.paymentId?.toString(),
    errorCode: data.errorCode,
    errorMessage: data.errorMessage,
  };
}
