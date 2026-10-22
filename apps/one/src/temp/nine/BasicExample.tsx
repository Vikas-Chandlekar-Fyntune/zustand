import { useState } from "react";
import { useNavigationBlocker } from "./useNavigationBlocker";

import Eight from "../eight";

export default function BasicExample() {
  const [enabled, setEnabled] = useState(false);

  useNavigationBlocker({ enabled });

  console.log("window", window.location.href);

  return (
    <>
      <button onClick={() => setEnabled((v) => !v)}>
        Navigation lock: {enabled ? "ON" : "OFF"}
      </button>

      <Eight />
    </>
  );
}
