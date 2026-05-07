"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import { sanitizeImagePath } from "@/lib/imagePath";

type CartItem = {
  id: string;
  quantity: number;
  menu_items: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
};

const supportedBanks = [
  "BDO",
  "BPI",
  "Metrobank",
  "Landbank",
  "UnionBank",
  "Security Bank",
  "RCBC",
  "PNB",
];

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedBank, setSelectedBank] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [gcashName, setGcashName] = useState("");
  const [gcashNumber, setGcashNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shippingError, setShippingError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [pageError, setPageError] = useState("");

  async function fetchProfile(currentUserId: string) {
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("full_name, phone, address")
      .eq("id", currentUserId)
      .single();

    if (error) {
      return;
    }

    if (profileData) {
      setFullName(profileData.full_name || "");
      setPhone(profileData.phone || "");
      setAddress(profileData.address || "");
    }
  }

  async function fetchCart(currentUserId: string) {
    const { data: cartData, error } = await supabase
      .from("cart")
      .select("id, quantity, menu_items(id, name, price, image)")
      .eq("user_id", currentUserId);

    if (error) {
      setPageError("Failed to load cart. Please refresh.");
      setLoading(false);
      return;
    }

    if (cartData) setCartItems(cartData as unknown as CartItem[]);
    setLoading(false);
  }

  async function updateQuantity(id: string, quantity: number) {
    try {
      if (quantity < 1) {
        await supabase.from("cart").delete().eq("id", id);
      } else {
        await supabase.from("cart").update({ quantity }).eq("id", id);
      }
    } catch {
      setPageError("Failed to update cart. Please try again.");
      return;
    }

    if (!userId) return;
    await fetchCart(userId);
  }

  function handlePaymentMethodChange(method: string) {
    setPaymentMethod(method);
    setPaymentError("");
  }

  function formatCardNumber(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 16);
    return digitsOnly.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
    if (digitsOnly.length < 3) return digitsOnly;
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  }

  async function handleCheckout() {
    if (!fullName || !phone || !address) {
      setShippingError("Please fill in all shipping information.");
      return;
    }

    setShippingError("");

    if (paymentMethod === "card") {
      const sanitizedCardNumber = cardNumber.replace(/\s/g, "");
      const hasValidExpiry = /^\d{2}\/\d{2}$/.test(cardExpiry);
      const hasValidCvv = /^\d{3,4}$/.test(cardCvv);

      if (!selectedBank || !cardholderName || sanitizedCardNumber.length < 12 || !hasValidExpiry || !hasValidCvv) {
        setPaymentError("Please complete your card details, including bank, card number, expiration, and CVV.");
        return;
      }
    }

    if (paymentMethod === "gcash") {
      const hasValidGcashNumber = /^\d{11}$/.test(gcashNumber);
      if (!gcashName || !hasValidGcashNumber) {
        setPaymentError("Please enter the GCash account name and a valid 11-digit mobile number.");
        return;
      }
    }

    setPaymentError("");

    let userIdFromSession = "";
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setPaymentError("Unable to verify your session. Please log in again.");
        return;
      }
      userIdFromSession = data.user?.id || "";
    } catch {
      setPaymentError("Network error while verifying session. Please try again.");
      return;
    }

    if (!userIdFromSession) {
      setPaymentError("Session expired. Please log in again.");
      return;
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.menu_items.price * item.quantity,
      0
    );

    const { data: order } = await supabase
      .from("orders")
      .insert({
        user_id: userIdFromSession,
        total,
        status: "pending",
        payment_method: paymentMethod,
        shipping_name: fullName,
        shipping_phone: phone,
        shipping_address: address,
      })
      .select()
      .single();

    if (order) {
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menu_items.id,
        quantity: item.quantity,
        price: item.menu_items.price,
      }));

      await supabase.from("order_items").insert(orderItems);
      await supabase.from("cart").delete().eq("user_id", userIdFromSession);
      router.push("/checkout");
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          setLoading(false);
          setPageError("Unable to connect to server. Please refresh.");
          return;
        }

        const user = data.user;
        if (!user) {
          router.push("/login");
          return;
        }

        setUserId(user.id);
        await Promise.all([fetchCart(user.id), fetchProfile(user.id)]);
      } catch {
        setLoading(false);
        setPageError("Connection timed out. Please check your internet and refresh.");
        return;
      }
    })();
  }, [router]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.menu_items.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-6 py-10 md:px-20">
        <h1 className="mb-8 text-3xl font-bold text-orange-500">Your Cart</h1>
        {pageError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pageError}
          </div>
        )}

        <div className="rounded-xl bg-white p-6 shadow">
          {cartItems.length === 0 ? (
            <p className="py-10 text-center text-gray-500">
              Your cart is empty.{" "}
              <Link href="/menu" className="text-orange-500">
                Order now!
              </Link>
            </p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="mb-4 grid grid-cols-1 gap-4 border-b pb-4 md:grid-cols-[minmax(0,1fr)_160px_140px] md:items-center md:gap-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <Image
                      src={sanitizeImagePath(item.menu_items.image)}
                      alt={item.menu_items.name}
                      width={80}
                      height={80}
                      className="h-20 w-20 flex-shrink-0 rounded object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{item.menu_items.name}</h3>
                      <p className="text-gray-500">PHP {item.menu_items.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 md:justify-center">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="rounded bg-gray-200 px-3 py-1 text-sm"
                    >
                      -
                    </button>
                    <span className="min-w-6 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="rounded bg-gray-200 px-3 py-1 text-sm"
                    >
                      +
                    </button>
                  </div>

                  <p className="w-full text-right font-semibold md:text-right">
                    PHP {item.menu_items.price * item.quantity}
                  </p>
                </div>
              ))}

              <div className="mt-6 border-t pt-6">
                <h3 className="mb-3 text-lg font-semibold">
                  Shipping Information
                </h3>

                <div className="mb-6 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Delivery Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your delivery address"
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {shippingError && (
                    <p className="text-sm text-red-500">{shippingError}</p>
                  )}
                </div>

                <h3 className="mb-3 text-lg font-semibold">Payment Method</h3>

                <div className="mb-6 grid gap-3 md:grid-cols-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3">
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => handlePaymentMethodChange("cash")}
                    />
                    <span>Cash on Delivery</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3">
                    <input
                      type="radio"
                      value="gcash"
                      checked={paymentMethod === "gcash"}
                      onChange={() => handlePaymentMethodChange("gcash")}
                    />
                    <span>GCash</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => handlePaymentMethodChange("card")}
                    />
                    <span>Card</span>
                  </label>
                </div>

                {paymentMethod === "cash" && (
                  <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-gray-700">
                    Pay in cash when your order arrives at your delivery
                    address.
                  </div>
                )}

                {paymentMethod === "gcash" && (
                  <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
                    <h4 className="mb-3 font-semibold text-gray-900">
                      GCash Details
                    </h4>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Account Name
                        </label>
                        <input
                          type="text"
                          value={gcashName}
                          onChange={(e) => setGcashName(e.target.value)}
                          placeholder="Enter your GCash name"
                          className="w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          GCash Number
                        </label>
                        <input
                          type="tel"
                          value={gcashNumber}
                          onChange={(e) =>
                            setGcashNumber(
                              e.target.value.replace(/\D/g, "").slice(0, 11)
                            )
                          }
                          placeholder="09XXXXXXXXX"
                          className="w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-gray-600">
                      Use your active GCash mobile number so the payment details
                      are ready before confirmation.
                    </p>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <h4 className="mb-3 font-semibold text-gray-900">
                      Card Details
                    </h4>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Supported Bank
                        </label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                        >
                          <option value="">Select a bank</option>
                          {supportedBanks.map((bank) => (
                            <option key={bank} value={bank}>
                              {bank}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value)}
                          placeholder="Name on card"
                          className="w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">
                          Card Number
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardNumber}
                          onChange={(e) =>
                            setCardNumber(formatCardNumber(e.target.value))
                          }
                          placeholder="1234 5678 9012 3456"
                          className="w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Expiration
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cardExpiry}
                          onChange={(e) =>
                            setCardExpiry(formatExpiry(e.target.value))
                          }
                          placeholder="MM/YY"
                          className="w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          CVV
                        </label>
                        <input
                          type="password"
                          inputMode="numeric"
                          value={cardCvv}
                          onChange={(e) =>
                            setCardCvv(
                              e.target.value.replace(/\D/g, "").slice(0, 4)
                            )
                          }
                          placeholder="3 or 4 digits"
                          className="w-full rounded-lg border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-gray-600">
                      For safety, your CVV is used only for validation in this
                      form and is not saved with the order.
                    </p>
                  </div>
                )}

                {paymentError && (
                  <p className="mb-4 text-sm text-red-500">{paymentError}</p>
                )}

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-xl font-bold">Total: PHP {total}</h2>
                  <button
                    onClick={handleCheckout}
                    className="rounded-lg bg-orange-500 px-6 py-3 text-white hover:bg-orange-600"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <footer className="mt-10 bg-gray-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-10 py-3 md:grid-cols-3">
          <div>
            <h4 className="mb-1 text-base font-bold text-orange-400">ELYAN Chicken Hub</h4>
            <p className="text-xs text-gray-300">Serving crispy and delicious fried chicken, wings, and combo meals.</p>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold">Reach Us</h4>
            <p className="text-xs text-gray-300">Philippines</p>
            <p className="text-xs text-gray-300">0912-345-6789</p>
            <p className="text-xs text-gray-300">elyanchickenhub@gmail.com</p>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold">Store Info</h4>
            <p className="text-xs text-gray-300">Store Hours: 9:00 AM - 9:00 PM</p>
            <p className="mt-2 text-xs text-gray-300">Delivery Areas: Talamban, Banilad, Lahug</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

