import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

const InvitationCodeCard = ({ orgId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orgId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  if (!orgId) return null;

  return (  
    <div className="w-full ">
      <div className="text-left">
        <div className="flex items-center gap-2">
          <code className="text-sm text-gray-600">
            <span className="font-bold text-base">Invitation Code:</span> {orgId}
          </code>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition duration-200 shadow-sm hover:shadow-md"
            title="Copy invitation code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-blue-600" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 -mt-1">
          Share this code with new members
        </p>
      </div>
    </div>
  );
};

export default InvitationCodeCard;
