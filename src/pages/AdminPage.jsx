import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Settings2, Eye, Plus, Trash2, ExternalLink } from "lucide-react";
import { AdminPanel } from "../components/AdminPanel";
import { makeConfig, BRAND_TYPES, uid } from "../data/templates";
import { apiGet, apiPost } from "../lib/api";

export default function AdminPage() {
  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [config, setConfig] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreType, setNewStoreType] = useState("hair");

  const configsRef = useRef({});

  useEffect(() => {
    (async () => {
      try {
        const list = await apiGet("getStoreList");
        setStores(list);
        if (list.length) {
          await switchStore(list[0].storeId, list);
        }
        setLoaded(true);
      } catch (e) {
        setLoadError(e.message || "店舗一覧の取得に失敗しました");
        setLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchStore = async (id, storeListOverride) => {
    if (configsRef.current[id]) {
      setActiveStoreId(id);
      setConfig(configsRef.current[id]);
      return;
    }
    try {
      const cfg = await apiGet("getStoreConfig", { store_id: id });
      configsRef.current[id] = cfg;
      setActiveStoreId(id);
      setConfig(cfg);
    } catch (e) {
      const list = storeListOverride || stores;
      const meta = list.find((s) => s.storeId === id);
      const cfg = { ...makeConfig({ name: meta?.name || "新規店舗", brandType: meta?.brandType || "hair" }), storeId: id };
      configsRef.current[id] = cfg;
      setActiveStoreId(id);
      setConfig(cfg);
    }
  };

  const updateConfig = (newConfig) => {
    configsRef.current[activeStoreId] = newConfig;
    setConfig(newConfig);
  };

  const handleSave = async () => {
    setSaveState("saving");
    try {
      await apiPost("saveStoreConfig", {
        storeId: activeStoreId,
        shopName: config.shopName,
        brandType: config.brandType || "hair",
        tagline: config.tagline,
        googleReviewUrl: config.googleReviewUrl,
        design: config.design,
        aiSettings: config.aiSettings,
        surveySteps: config.surveySteps,
      });
      setStores((prev) => prev.map((s) => (s.storeId === activeStoreId ? { ...s, name: config.shopName } : s)));
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1800);
    } catch (e) {
      setSaveState("error");
      alert("保存に失敗しました: " + (e.message || "不明なエラー"));
      setTimeout(() => setSaveState("idle"), 2500);
    }
  };

  const handleAddStore = async () => {
    const name = newStoreName.trim();
    if (!name) return;
    try {
      const { storeId } = await apiPost("createStore", { name, brandType: newStoreType });
      const cfg = { ...makeConfig({ name, brandType: newStoreType }), storeId };
      // テンプレートの質問をすぐにサーバーへ反映しておく
      await apiPost("saveStoreConfig", {
        storeId,
        shopName: cfg.shopName,
        brandType: newStoreType,
        tagline: cfg.tagline,
        googleReviewUrl: cfg.googleReviewUrl,
        design: cfg.design,
        aiSettings: cfg.aiSettings,
        surveySteps: cfg.surveySteps,
      });
      configsRef.current[storeId] = cfg;
      setStores((prev) => [...prev, { storeId, name, brandType: newStoreType }]);
      setActiveStoreId(storeId);
      setConfig(cfg);
      setShowAddForm(false);
      setNewStoreName("");
      setNewStoreType("hair");
    } catch (e) {
      alert("店舗の追加に失敗しました: " + e.message);
    }
  };

  const handleDeleteStore = async () => {
    if (stores.length <= 1) return;
    const target = stores.find((s) => s.storeId === activeStoreId);
    const ok = window.confirm(`「${target?.name || ""}」の設定を削除しますか?この操作は元に戻せません。`);
    if (!ok) return;
    try {
      await apiPost("deleteStore", { storeId: activeStoreId });
      delete configsRef.current[activeStoreId];
      const newList = stores.filter((s) => s.storeId !== activeStoreId);
      setStores(newList);
      if (newList.length) await switchStore(newList[0].storeId, newList);
      else {
        setActiveStoreId(null);
        setConfig(null);
      }
    } catch (e) {
      alert("店舗の削除に失敗しました: " + e.message);
    }
  };

  if (!loaded) {
    return (
      <div className="k-root k-loading-root">
        <div className="k-spinner" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="k-root k-loading-root" style={{ flexDirection: "column", gap: 12 }}>
        <p className="k-error-text">{loadError}</p>
        <p style={{ fontSize: 12, color: "#8C8C86" }}>
          .env の VITE_API_BASE_URL が正しいGAS WebアプリのURLになっているか確認してください。
        </p>
      </div>
    );
  }

  return (
    <div className="k-root">
      <header className="k-app-header">
        <div className="k-app-header-brand">
          <span className="k-app-header-mark">口</span>
          <div>
            <div className="k-app-header-title">口コミ生成アンケートシステム</div>
            <div className="k-app-header-sub">SHINCA Group / 管理画面</div>
          </div>
        </div>
      </header>

      <div className="k-store-bar">
        <div className="k-store-select-wrap">
          <select
            className="k-input k-store-select"
            value={activeStoreId || ""}
            onChange={(e) => switchStore(e.target.value)}
          >
            {stores.map((s) => (
              <option key={s.storeId} value={s.storeId}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="k-icon-btn k-icon-btn-danger"
            onClick={handleDeleteStore}
            disabled={stores.length <= 1}
            aria-label="この店舗を削除"
            title="この店舗を削除"
          >
            <Trash2 size={14} />
          </button>
          {activeStoreId && (
            <Link
              className="k-secondary-btn k-input-sm"
              to={`/survey/${activeStoreId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Eye size={14} /> お客様画面を開く <ExternalLink size={12} />
            </Link>
          )}
        </div>

        {!showAddForm ? (
          <button type="button" className="k-ghost-btn k-store-add-toggle" onClick={() => setShowAddForm(true)}>
            <Plus size={14} /> 店舗を追加
          </button>
        ) : (
          <div className="k-add-store-form">
            <input
              className="k-input k-input-sm"
              placeholder="店舗名"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              autoFocus
            />
            <select className="k-input k-input-sm" value={newStoreType} onChange={(e) => setNewStoreType(e.target.value)}>
              {BRAND_TYPES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
            <button type="button" className="k-primary-btn k-input-sm" onClick={handleAddStore} disabled={!newStoreName.trim()}>
              追加
            </button>
            <button
              type="button"
              className="k-secondary-btn k-input-sm"
              onClick={() => {
                setShowAddForm(false);
                setNewStoreName("");
              }}
            >
              キャンセル
            </button>
          </div>
        )}
      </div>

      <main className="k-main">
        {config && (
          <AdminPanel config={config} setConfig={updateConfig} onSave={handleSave} saveState={saveState} />
        )}
      </main>
    </div>
  );
}
