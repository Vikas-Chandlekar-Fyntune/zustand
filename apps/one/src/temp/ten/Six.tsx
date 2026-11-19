import { useEffect, useState } from "react";
import {
  DomRemovalProvider,
  useDomRemoval,
  SECURE_TOKEN,
} from "./context/DomRemovalContext1";
import { useBodyProtection } from "./useBodyProtection";

export default function Six() {
  return (
    <DomRemovalProvider>
      <ProtectedContent />
      <button
        onClick={() => alert("ok")}
        className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        OK
      </button>
    </DomRemovalProvider>
  );
}

function ProtectedContent() {
  // Target the dynamic runtime token instead of a predictable static class name
  const { isRemoved, isPresent } = useDomRemoval({
    selectors: [`.${SECURE_TOKEN}`],
    enabled: true,
  });

  useBodyProtection({
    enabled: isRemoved,
    className: "dom-protected",
    ariaHidden: true,
  });

  useEffect(() => {
    if (isRemoved) {
      console.warn(
        "Security Alert: Protected element was tampered with or removed.",
      );
    }
  }, [isRemoved]);

  return (
    <div className="min-h-screen p-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        Secure Element Detection
      </h1>
      <One />
      <p
        className={`mt-6 rounded-lg p-4 text-sm font-medium ${
          isRemoved
            ? "bg-red-100 text-red-700"
            : isPresent
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {isRemoved
          ? "Tampering detected: Element was removed"
          : isPresent
            ? "Element is secure and present"
            : "Waiting for element initialization"}
      </p>
    </div>
  );
}

function One() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeId = setTimeout(() => setShow(true), 1000);
    return () => clearTimeout(timeId);
  }, []);

  return (
    <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {show && (
        <div
          className={`${SECURE_TOKEN} rounded-lg bg-blue-100 p-4 font-semibold text-blue-800`}
        >
          Protected Canary Node
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => alert("Action executed")}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Submit
        </button>
        <button
          onClick={() => setShow(false)}
          className="rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Remove element (test)
        </button>
      </div>
    </div>
  );
}
