import { useEffect, useState } from "react";
import { DomRemovalProvider, useDomRemoval } from "./context/DomRemovalContext";

// WORKING
export default function Four() {
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
  const { isRemoved, isPresent } = useDomRemoval({
    selectors: [".bee"],
    enabled: true,
  });

  useEffect(() => {
    if (isRemoved) {
      alert("Api calling");
    }
  }, [isRemoved]);

  return (
    <div
      inert={isRemoved ? true : undefined}
      aria-hidden={isRemoved || undefined}
      className={`min-h-screen p-8 transition-opacity duration-300 ${
        isRemoved ? "pointer-events-none select-none opacity-40" : "opacity-100"
      }`}
    >
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        Element Removal Detection
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
          ? "Element was removed"
          : isPresent
            ? "Element is present"
            : "Waiting for element"}
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
        <div className="bee rounded-lg bg-blue-100 p-4 font-semibold text-blue-800">
          Swal
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => alert("vikas")}
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
