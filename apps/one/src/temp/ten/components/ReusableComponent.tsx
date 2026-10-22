import React, { forwardRef, useState } from "react";

interface ReusableComponentProps {
  title?: string;
  isBlocking?: boolean;
  handleClick?: () => void;
  children?: React.ReactNode;
}

const ReusableComponent = forwardRef<HTMLDivElement, ReusableComponentProps>(
  function ReusableComponent(
    { title = "Children List", isBlocking = false, handleClick, children },
    ref,
  ) {
    const [showChild2, setShowChild2] = useState(true);

    const buttonClass =
      "cursor-pointer rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
      <div className="space-y-6 p-6">
        <div
          ref={ref}
          inert={isBlocking}
          aria-hidden={isBlocking || undefined}
          className={`space-y-4 rounded-xl border p-5 shadow-sm transition-opacity ${
            isBlocking
              ? "border-gray-200 bg-gray-50 opacity-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

          <div className="space-y-3">
            <div className="rounded-lg bg-gray-50 p-3 text-gray-800">
              Child 1
            </div>

            {showChild2 && (
              <div className="rounded-lg bg-gray-50 p-3 text-gray-800">
                Child 2
              </div>
            )}

            <div className="rounded-lg bg-gray-50 p-3 text-gray-800">
              Child 3
            </div>

            {children}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowChild2(false)}
              disabled={isBlocking || !showChild2}
              className="cursor-pointer rounded-lg border border-red-300 bg-white px-4 py-2 font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove Child 2
            </button>

            <button
              type="button"
              onClick={handleClick}
              disabled={isBlocking}
              className={buttonClass}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  },
);

export default ReusableComponent;
