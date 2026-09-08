"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const GET_PRICE = gql`
  query {
    getAdminPreviewPrice {
      chatPrice
      callPrice
      isOfferApplied
    }
  }
`;

const GET_CONFIG = gql`
  query {
    getPricingConfig {
      isGlobalOfferEnabled
      globalChatPrice
      globalCallPrice
      isFirstOfferEnabled
      firstChatPrice
      firstCallPrice

      isSecondOfferEnabled
      secondChatPrice
      secondCallPrice
    }
  }
`;

const UPDATE_CONFIG = gql`
  mutation UpdatePricing(
    $isGlobalOfferEnabled: Boolean
    $globalChatPrice: Int
    $globalCallPrice: Int
    $isFirstOfferEnabled: Boolean
    $firstChatPrice: Int
    $firstCallPrice: Int
    $isSecondOfferEnabled: Boolean
    $secondChatPrice: Int
    $secondCallPrice: Int
  ) {
    updatePricingConfig(
      isGlobalOfferEnabled: $isGlobalOfferEnabled
      globalChatPrice: $globalChatPrice
      globalCallPrice: $globalCallPrice

      isFirstOfferEnabled: $isFirstOfferEnabled
      firstChatPrice: $firstChatPrice
      firstCallPrice: $firstCallPrice

      isSecondOfferEnabled: $isSecondOfferEnabled
      secondChatPrice: $secondChatPrice
      secondCallPrice: $secondCallPrice
    ) {
      id
    }
  }
`;

export default function PricingPanel() {
  const { data: priceData, loading, refetch } = useQuery(GET_PRICE);
  const { data: configData } = useQuery(GET_CONFIG);

  const [form, setForm] = useState({
    isGlobalOfferEnabled: false,
    globalChatPrice: 0,
    globalCallPrice: 0,
    isFirstOfferEnabled: false,
    firstChatPrice: 0,
    firstCallPrice: 0,
    isSecondOfferEnabled: false,
    secondChatPrice: 0,
    secondCallPrice: 0,
  });

  useEffect(() => {
    if (configData?.getPricingConfig) {
      setForm(configData.getPricingConfig);
    }
  }, [configData]);

  const [updateConfig, { loading: saving }] = useMutation(UPDATE_CONFIG, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    toast.success("Updated Successfully")
    await updateConfig({
      variables: {
        ...form,

        globalChatPrice: Number(form.globalChatPrice),
        globalCallPrice: Number(form.globalCallPrice),

        firstChatPrice: Number(form.firstChatPrice),
        firstCallPrice: Number(form.firstCallPrice),

        secondChatPrice: Number(form.secondChatPrice),
        secondCallPrice: Number(form.secondCallPrice),
      },
    });
  };

  if (loading) return <p>Loading...</p>;

  const price = priceData?.getAdminPreviewPrice;

  return (
    <div className="grid grid-cols-6 items-start w-full gap-6 p-6">
      <div className="p-5 overflow-hidden border border-gray-300 shadow-xl col-span-5 rounded-xl flex flex-col items-center space-y-6">
        <h2 className="font-semibold">Pricing Config</h2>

        <div className="grid grid-cols-3 gap-5">
          <div className="border border-gray-200 bg-purple-200 rounded-xl shadow-xl p-4">
            <h3 className="font-semibold font-serif text-center text-sm  mb-2">
              First Time Offer
            </h3>

            <Toggle
              value={form.isFirstOfferEnabled}
              onChange={() =>
                handleChange("isFirstOfferEnabled", !form.isFirstOfferEnabled)
              }
            />
            <div className="flex items-center gapjustify-between gap-10">
              <Input
                label="Chat Price"
                className="border border-gray-200 bg-white rounded-lg p-1 focus:outline-none  focus:ring-0"
                value={form.firstChatPrice}
                onChange={(v) => handleChange("firstChatPrice", v)}
              />

              <Input
                label="Call Price"
                className="border border-gray-200 bg-white rounded-lg p-1 focus:outline-none  focus:ring-0"
                value={form.firstCallPrice}
                onChange={(v) => handleChange("firstCallPrice", v)}
              />
            </div>
          </div>

          <div className="border border-gray-200 bg-violet-200 rounded-xl shadow-xl p-4">
            <h3 className="font-semibold font-serif text-center text-sm  mb-2">
              Second Time Offer
            </h3>

            <Toggle
              value={form.isSecondOfferEnabled}
              onChange={() =>
                handleChange("isSecondOfferEnabled", !form.isSecondOfferEnabled)
              }
            />
            <div className="flex items-center gapjustify-between gap-10">
              <Input
                label="Chat Price"
                className="border border-gray-200 rounded-lg p-1 focus:outline-none bg-white  focus:ring-0"
                value={form.secondChatPrice}
                onChange={(v) => handleChange("secondChatPrice", v)}
              />
              <Input
                label="Call Price"
                className="border border-gray-200 rounded-lg p-1 bg-white focus:outline-none  focus:ring-0"
                value={form.secondCallPrice}
                onChange={(v) => handleChange("secondCallPrice", v)}
              />
            </div>
          </div>

          <div className="border border-gray-200 bg-indigo-200 rounded-xl shadow-xl p-4">
            <h3 className="font-semibold font-serif text-center text-sm mb-2">
              Global Offer
            </h3>

            <Toggle
              value={form.isGlobalOfferEnabled}
              onChange={() =>
                handleChange("isGlobalOfferEnabled", !form.isGlobalOfferEnabled)
              }
            />

            <div className="flex gap-10">
              <Input
                label="Chat Price"
                value={form.globalChatPrice}
                onChange={(v) => handleChange("globalChatPrice", v)}
                className="bg-white"
              />

              <Input
                label="Call Price"
                value={form.globalCallPrice}
                onChange={(v) => handleChange("globalCallPrice", v)}
                className="bg-white"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-[40%] rounded-full bg-black text-white py-2 "
        >
          {saving ? "Saving..." : "Update"}
        </button>
      </div>

      <div className="overflow-hidden border border-purple-300 shadow-xl col-span-1 flex flex-col rounded-xl">
        <h2 className="font-semibold p-3 text-center bg-purple-300 mb-3">
          Preview Pricing
        </h2>

        <div className="px-4 py-2 space-y-2 text-purple-700">
          <div className="bg-purple-50 p-2 shadow-xl rounded-xl">
            <h3 className="font-semibold text-sm mb-2">First Time Price</h3>

            <p className="font-medium">
              <span className="text-xs">Chat: ₹</span>
              {form?.isFirstOfferEnabled
                ? form.firstChatPrice
                : (price?.chatPrice ?? 0)}
            </p>

            <p className="font-medium">
              <span className="text-xs">Call: ₹</span>
              {form?.isFirstOfferEnabled
                ? form.firstCallPrice
                : (price?.callPrice ?? 0)}
            </p>
          </div>
          <div className="bg-purple-50 p-2 shadow-xl rounded-xl">
            <h3 className="font-semibold text-sm mb-2">Second Time Price</h3>

            <p className="font-medium">
              <span className="text-xs">Chat: ₹</span>
              {form?.isSecondOfferEnabled ? form.secondChatPrice : "—"}
            </p>

            <p className="font-medium">
              <span className="text-xs">Call: ₹</span>
              {form?.isSecondOfferEnabled ? form.secondCallPrice : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div className="flex justify-between items-center mb-3">
      <span>Enable</span>
      <button
        onClick={onChange}
        className={`w-12 h-6 flex items-center rounded-full p-1 ${
          value ? "bg-green-500" : "bg-gray-100"
        }`}
      >
        <div
          className={` w-4 h-4 rounded-full transform ${
            value ? "translate-x-6 bg-white" : "bg-gray-400"
          }`}
        />
      </button>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div className="mb-3">
      <p className="mb-1 text-sm">{label}</p>
      <input
        type="number"
        className="border border-gray-300 bg-white rounded-lg w-1/2 p-1 focus:outline-none  focus:ring-0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
