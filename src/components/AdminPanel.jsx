import React, { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Save } from "lucide-react";
import { uid } from "../data/templates";

function Field({ label, children, hint }) {
  return (
    <label className="k-field">
      <span className="k-field-label">{label}</span>
      {children}
      {hint && <span className="k-field-hint">{hint}</span>}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  管理画面: 基本設定タブ                                              */
/* ------------------------------------------------------------------ */

function BasicSettingsTab({ config, setConfig }) {
  return (
    <div className="k-panel-body">
      <Field label="店舗名">
        <input
          className="k-input"
          value={config.shopName}
          onChange={(e) => setConfig({ ...config, shopName: e.target.value })}
        />
      </Field>
      <Field label="キャッチコピー(お客様画面の見出し下に表示)">
        <input
          className="k-input"
          value={config.tagline}
          onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
        />
      </Field>
      <Field
        label="Google口コミ投稿ページのURL"
        hint="口コミ文章のコピー後、このURLへ自動的に移動します"
      >
        <input
          className="k-input"
          placeholder="https://search.google.com/local/writereview?placeid=..."
          value={config.googleReviewUrl}
          onChange={(e) => setConfig({ ...config, googleReviewUrl: e.target.value })}
        />
      </Field>
      <div className="k-row2">
        <Field label="メインカラー">
          <div className="k-color-row">
            <input
              type="color"
              className="k-color-swatch"
              value={config.design.primaryColor}
              onChange={(e) =>
                setConfig({
                  ...config,
                  design: { ...config.design, primaryColor: e.target.value },
                })
              }
            />
            <input
              className="k-input"
              value={config.design.primaryColor}
              onChange={(e) =>
                setConfig({
                  ...config,
                  design: { ...config.design, primaryColor: e.target.value },
                })
              }
            />
          </div>
        </Field>
        <Field label="アクセントカラー">
          <div className="k-color-row">
            <input
              type="color"
              className="k-color-swatch"
              value={config.design.accentColor}
              onChange={(e) =>
                setConfig({
                  ...config,
                  design: { ...config.design, accentColor: e.target.value },
                })
              }
            />
            <input
              className="k-input"
              value={config.design.accentColor}
              onChange={(e) =>
                setConfig({
                  ...config,
                  design: { ...config.design, accentColor: e.target.value },
                })
              }
            />
          </div>
        </Field>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  管理画面: アンケート項目編集タブ                                    */
/* ------------------------------------------------------------------ */

function OptionsEditor({ question, onChange }) {
  const options = question.options || [];

  const updateOption = (id, label) => {
    onChange({
      ...question,
      options: options.map((o) => (o.id === id ? { ...o, label } : o)),
    });
  };
  const addOption = () => {
    onChange({ ...question, options: [...options, { id: uid("o"), label: "" }] });
  };
  const removeOption = (id) => {
    onChange({ ...question, options: options.filter((o) => o.id !== id) });
  };

  return (
    <div className="k-options-editor">
      {options.map((o) => (
        <div key={o.id} className="k-option-row">
          <input
            className="k-input k-input-sm"
            value={o.label}
            placeholder="選択肢"
            onChange={(e) => updateOption(o.id, e.target.value)}
          />
          <button
            type="button"
            className="k-icon-btn k-icon-btn-danger"
            onClick={() => removeOption(o.id)}
            aria-label="選択肢を削除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" className="k-ghost-btn" onClick={addOption}>
        <Plus size={14} /> 選択肢を追加
      </button>
    </div>
  );
}

function QuestionEditor({ question, index, total, onChange, onRemove, onMove }) {
  return (
    <div className="k-question-card">
      <div className="k-question-card-head">
        <span className="k-question-index">Q{index + 1}</span>
        <div className="k-question-head-actions">
          <button
            type="button"
            className="k-icon-btn"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label="上へ移動"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            className="k-icon-btn"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            aria-label="下へ移動"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            className="k-icon-btn k-icon-btn-danger"
            onClick={onRemove}
            aria-label="質問を削除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <Field label="質問文">
        <input
          className="k-input"
          value={question.label}
          onChange={(e) => onChange({ ...question, label: e.target.value })}
        />
      </Field>

      <div className="k-row2">
        <Field label="回答形式">
          <select
            className="k-input"
            value={question.type}
            onChange={(e) => {
              const type = e.target.value;
              if (type === "text") {
                const { options, maxSelect, ...rest } = question;
                onChange({ ...rest, type });
              } else {
                onChange({
                  ...question,
                  type,
                  options: question.options || [{ id: uid("o"), label: "" }],
                  ...(type === "multi" ? { maxSelect: question.maxSelect || 3 } : {}),
                });
              }
            }}
          >
            <option value="single">単一選択</option>
            <option value="multi">複数選択</option>
            <option value="text">自由記述</option>
          </select>
        </Field>

        <Field label="必須にする">
          <div className="k-switch-row">
            <input
              type="checkbox"
              id={`req-${question.id}`}
              checked={!!question.required}
              onChange={(e) => onChange({ ...question, required: e.target.checked })}
            />
            <label htmlFor={`req-${question.id}`}>必須項目にする</label>
          </div>
        </Field>
      </div>

      {question.type === "multi" && (
        <Field label="最大選択数">
          <input
            type="number"
            min={1}
            className="k-input k-input-num"
            value={question.maxSelect || 1}
            onChange={(e) =>
              onChange({ ...question, maxSelect: Math.max(1, Number(e.target.value) || 1) })
            }
          />
        </Field>
      )}

      {(question.type === "single" || question.type === "multi") && (
        <OptionsEditor question={question} onChange={onChange} />
      )}
    </div>
  );
}

function StepEditor({ step, index, total, onChange, onRemove, onMove }) {
  const updateQuestion = (qId, newQ) => {
    onChange({
      ...step,
      questions: step.questions.map((q) => (q.id === qId ? newQ : q)),
    });
  };
  const removeQuestion = (qId) => {
    onChange({ ...step, questions: step.questions.filter((q) => q.id !== qId) });
  };
  const moveQuestion = (qId, dir) => {
    const qs = [...step.questions];
    const i = qs.findIndex((q) => q.id === qId);
    const j = i + dir;
    if (j < 0 || j >= qs.length) return;
    [qs[i], qs[j]] = [qs[j], qs[i]];
    onChange({ ...step, questions: qs });
  };
  const addQuestion = () => {
    onChange({
      ...step,
      questions: [
        ...step.questions,
        {
          id: uid("q"),
          type: "single",
          label: "",
          required: false,
          options: [{ id: uid("o"), label: "" }],
        },
      ],
    });
  };

  return (
    <div className="k-step-card">
      <div className="k-step-card-head">
        <input
          className="k-input k-step-title-input"
          value={step.title}
          onChange={(e) => onChange({ ...step, title: e.target.value })}
        />
        <div className="k-question-head-actions">
          <button
            type="button"
            className="k-icon-btn"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label="ステップを上へ"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            className="k-icon-btn"
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            aria-label="ステップを下へ"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            className="k-icon-btn k-icon-btn-danger"
            onClick={onRemove}
            aria-label="ステップを削除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {step.questions.map((q, qi) => (
        <QuestionEditor
          key={q.id}
          question={q}
          index={qi}
          total={step.questions.length}
          onChange={(nq) => updateQuestion(q.id, nq)}
          onRemove={() => removeQuestion(q.id)}
          onMove={(dir) => moveQuestion(q.id, dir)}
        />
      ))}

      <button type="button" className="k-ghost-btn" onClick={addQuestion}>
        <Plus size={14} /> 質問を追加
      </button>
    </div>
  );
}

function QuestionsTab({ config, setConfig }) {
  const steps = config.surveySteps;

  const updateStep = (id, newStep) => {
    setConfig({
      ...config,
      surveySteps: steps.map((s) => (s.id === id ? newStep : s)),
    });
  };
  const removeStep = (id) => {
    if (steps.length <= 1) return;
    setConfig({ ...config, surveySteps: steps.filter((s) => s.id !== id) });
  };
  const moveStep = (id, dir) => {
    const arr = [...steps];
    const i = arr.findIndex((s) => s.id === id);
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setConfig({ ...config, surveySteps: arr });
  };
  const addStep = () => {
    setConfig({
      ...config,
      surveySteps: [
        ...steps,
        {
          id: uid("step"),
          title: `STEP ${steps.length + 1}`,
          questions: [],
        },
      ],
    });
  };

  return (
    <div className="k-panel-body">
      {steps.map((s, i) => (
        <StepEditor
          key={s.id}
          step={s}
          index={i}
          total={steps.length}
          onChange={(ns) => updateStep(s.id, ns)}
          onRemove={() => removeStep(s.id)}
          onMove={(dir) => moveStep(s.id, dir)}
        />
      ))}
      <button type="button" className="k-secondary-btn" onClick={addStep}>
        <Plus size={16} /> STEPを追加
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  管理画面: AI生成設定タブ                                            */
/* ------------------------------------------------------------------ */

function AiSettingsTab({ config, setConfig }) {
  const { aiSettings } = config;
  const setAi = (patch) => setConfig({ ...config, aiSettings: { ...aiSettings, ...patch } });

  const updateKeyword = (i, val) => {
    const kws = [...aiSettings.keywords];
    kws[i] = val;
    setAi({ keywords: kws });
  };
  const addKeyword = () => setAi({ keywords: [...aiSettings.keywords, ""] });
  const removeKeyword = (i) =>
    setAi({ keywords: aiSettings.keywords.filter((_, idx) => idx !== i) });

  return (
    <div className="k-panel-body">
      <div className="k-row2">
        <Field label="生成する文字数(最小)">
          <input
            type="number"
            className="k-input"
            value={aiSettings.minLength}
            onChange={(e) => setAi({ minLength: Number(e.target.value) || 0 })}
          />
        </Field>
        <Field label="生成する文字数(最大)">
          <input
            type="number"
            className="k-input"
            value={aiSettings.maxLength}
            onChange={(e) => setAi({ maxLength: Number(e.target.value) || 0 })}
          />
        </Field>
      </div>

      <Field
        label="盛り込みたいキーワード"
        hint="口コミ文章に自然な範囲で含めたい言葉を登録します"
      >
        <div className="k-options-editor">
          {aiSettings.keywords.map((k, i) => (
            <div key={i} className="k-option-row">
              <input
                className="k-input k-input-sm"
                value={k}
                placeholder="例: 丁寧なカウンセリング"
                onChange={(e) => updateKeyword(i, e.target.value)}
              />
              <button
                type="button"
                className="k-icon-btn k-icon-btn-danger"
                onClick={() => removeKeyword(i)}
                aria-label="キーワードを削除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button type="button" className="k-ghost-btn" onClick={addKeyword}>
            <Plus size={14} /> キーワードを追加
          </button>
        </div>
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  管理画面 本体                                                       */
/* ------------------------------------------------------------------ */

function AdminPanel({ config, setConfig, onSave, saveState }) {
  const [tab, setTab] = useState("basic");

  const tabs = [
    { id: "basic", label: "基本設定" },
    { id: "questions", label: "アンケート項目" },
    { id: "ai", label: "AI生成設定" },
  ];

  return (
    <div className="k-admin">
      <div className="k-admin-toolbar">
        <div className="k-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`k-tab ${tab === t.id ? "k-tab-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" className="k-primary-btn" onClick={onSave}>
          <Save size={15} />
          {saveState === "saving" ? "保存中…" : saveState === "saved" ? "保存しました" : "保存する"}
        </button>
      </div>

      {tab === "basic" && <BasicSettingsTab config={config} setConfig={setConfig} />}
      {tab === "questions" && <QuestionsTab config={config} setConfig={setConfig} />}
      {tab === "ai" && <AiSettingsTab config={config} setConfig={setConfig} />}
    </div>
  );
}

export { Field, AdminPanel };
