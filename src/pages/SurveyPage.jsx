import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CustomerSurvey } from "../components/CustomerSurvey";
import { apiGet } from "../lib/api";

export default function SurveyPage() {
  const { storeId } = useParams();
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await apiGet("getStoreConfig", { store_id: storeId });
        if (!cancelled) setConfig(cfg);
      } catch (e) {
        if (!cancelled) setError(e.message || "アンケート情報の取得に失敗しました");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  if (error) {
    return (
      <div className="k-root k-loading-root" style={{ flexDirection: "column", gap: 8 }}>
        <p className="k-error-text">{error}</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="k-root k-loading-root">
        <div className="k-spinner" />
      </div>
    );
  }

  return (
    <div className="k-root">
      <main className="k-main">
        <CustomerSurvey config={config} />
      </main>
    </div>
  );
}
