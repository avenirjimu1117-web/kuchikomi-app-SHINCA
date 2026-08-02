import React, { useState, useCallback } from "react";
import {
  Check,
  Sparkles,
  Quote,
  Copy,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { generateReviewText, logCopyAction } from "../lib/reviewGen";

function QuestionInput({ question, value, onChange }) {
  if (question.type === "text") {
    return (
      <textarea
        className="k-textarea"
        rows={4}
        placeholder="ここに感想を入力してください"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (question.type === "single") {
    return (
      <div className="k-choice-list">
        {question.options.map((o) => (
          <button
            type="button"
            key={o.id}
            className={`k-choice-item ${value === o.id ? "k-choice-item-active" : ""}`}
            onClick={() => onChange(o.id)}
          >
            <span className="k-choice-radio">{value === o.id && <span className="k-choice-radio-dot" />}</span>
            {o.label}
          </button>
        ))}
      </div>
    );
  }

  // multi
  const selected = value || [];
  const atMax = selected.length >= (question.maxSelect || 99);
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (!atMax) {
      onChange([...selected, id]);
    }
  };
  return (
    <div className="k-choice-list">
      {question.maxSelect && (
        <div className="k-multi-hint">最大{question.maxSelect}個まで選択できます</div>
      )}
      {question.options.map((o) => {
        const checked = selected.includes(o.id);
        return (
          <button
            type="button"
            key={o.id}
            disabled={!checked && atMax}
            className={`k-choice-item ${checked ? "k-choice-item-active" : ""}`}
            onClick={() => toggle(o.id)}
          >
            <span className="k-choice-check">{checked && <Check size={13} strokeWidth={3} />}</span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ProgressSteps({ steps, currentIndex }) {
  return (
    <div className="k-progress">
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="k-progress-item">
            <div
              className={
                "k-progress-dot " +
                (i < currentIndex ? "k-progress-dot-done" : i === currentIndex ? "k-progress-dot-active" : "")
              }
            >
              {i < currentIndex ? <Check size={13} strokeWidth={3} /> : i + 1}
            </div>
            <span className="k-progress-label">{s.title}</span>
          </div>
          {i < steps.length - 1 && <div className="k-progress-line" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function ResultScreen({ config, reviewText, setReviewText, responseId, onRegenerate, regenerating, onRestart }) {
  const [copied, setCopied] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const handleCopyAndGo = async () => {
    try {
      await navigator.clipboard.writeText(reviewText);
    } catch (e) {
      /* clipboard may be unavailable in some contexts */
    }
    setCopied(true);
    logCopyAction(responseId);
    if (config.googleReviewUrl) {
      window.open(config.googleReviewUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="k-result">
      <div className="k-result-badge">
        <Sparkles size={14} /> アンケート回答結果を元に口コミ文章案を作成しました
      </div>

      <div className="k-result-card">
        <Quote className="k-result-quote" size={26} />
        {manualMode ? (
          <textarea
            className="k-textarea k-result-textarea"
            rows={7}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
        ) : (
          <p className="k-result-text">{reviewText}</p>
        )}
        <p className="k-result-note">
          上記はアンケート結果を元にAIが作成した文章案です。必ず内容をチェックし、ご自身の体験や感想を反映させたうえで、編集してから口コミとして活用してください。
        </p>
      </div>

      <button type="button" className="k-primary-btn k-result-cta" onClick={handleCopyAndGo}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "コピーしました。Googleクチコミへ移動します" : "この口コミをコピーして進む"}
        {!copied && <ExternalLink size={14} />}
      </button>

      <div className="k-result-links">
        <button
          type="button"
          className="k-link-btn"
          onClick={() => {
            setCopied(false);
            onRegenerate();
          }}
          disabled={regenerating}
        >
          <RefreshCw size={13} className={regenerating ? "k-spin" : ""} />
          もう一度作成する
        </button>
        <button type="button" className="k-link-btn" onClick={() => setManualMode((m) => !m)}>
          {manualMode ? "AI文章案に戻す" : "自分で文章を考えて編集する"}
        </button>
      </div>

      <button type="button" className="k-text-btn" onClick={onRestart}>
        <ChevronLeft size={13} /> 最初からやり直す
      </button>
    </div>
  );
}

function CustomerSurvey({ config }) {
  const steps = config.surveySteps;
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState("survey"); // survey | generating | result | error
  const [reviewText, setReviewText] = useState("");
  const [responseId, setResponseId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const currentStep = steps[stepIndex];

  const setAnswer = (qId, val) => setAnswers((a) => ({ ...a, [qId]: val }));

  const isStepValid = () => {
    if (!currentStep) return true;
    return currentStep.questions.every((q) => {
      if (!q.required) return true;
      const v = answers[q.id];
      if (q.type === "multi") return Array.isArray(v) && v.length > 0;
      if (q.type === "text") return typeof v === "string" && v.trim().length > 0;
      return !!v;
    });
  };

  const runGenerate = useCallback(async () => {
    setPhase("generating");
    setErrorMsg("");
    try {
      const result = await generateReviewText(config, answers);
      setReviewText(result.reviewText);
      setResponseId(result.responseId);
      setPhase("result");
    } catch (e) {
      setErrorMsg("文章の生成に失敗しました。もう一度お試しください。");
      setPhase("error");
    }
  }, [config, answers]);

  const handleNext = () => {
    if (!isStepValid()) return;
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      runGenerate();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const handleRestart = () => {
    setStepIndex(0);
    setAnswers({});
    setPhase("survey");
    setReviewText("");
    setResponseId(null);
  };

  return (
    <div
      className="k-customer"
      style={{
        "--k-primary": config.design.primaryColor,
        "--k-accent": config.design.accentColor,
      }}
    >
      <div className="k-customer-header">
        <div className="k-customer-shopname">{config.shopName}</div>
        <div className="k-customer-tagline">{config.tagline}</div>
      </div>

      {phase === "survey" && currentStep && (
        <>
          <ProgressSteps steps={steps} currentIndex={stepIndex} />
          <div className="k-survey-card" key={currentStep.id}>
            <h3 className="k-survey-step-title">{currentStep.title}</h3>
            {currentStep.questions.map((q) => (
              <div className="k-question-block" key={q.id}>
                <div className="k-question-label-row">
                  {q.required && <span className="k-required-badge">必須</span>}
                  <span className="k-question-label">{q.label}</span>
                </div>
                <QuestionInput
                  question={q}
                  value={answers[q.id]}
                  onChange={(v) => setAnswer(q.id, v)}
                />
              </div>
            ))}
          </div>

          <div className="k-survey-nav">
            <button
              type="button"
              className="k-secondary-btn"
              onClick={handleBack}
              disabled={stepIndex === 0}
            >
              <ChevronLeft size={15} /> 戻る
            </button>
            <button type="button" className="k-primary-btn" onClick={handleNext} disabled={!isStepValid()}>
              {stepIndex < steps.length - 1 ? (
                <>
                  次へ <ChevronRight size={15} />
                </>
              ) : (
                <>
                  <Sparkles size={15} /> アンケートに回答する
                </>
              )}
            </button>
          </div>
        </>
      )}

      {phase === "generating" && (
        <div className="k-generating">
          <div className="k-spinner" />
          <p>アンケート回答をもとに口コミ文章案を作成しています…</p>
        </div>
      )}

      {phase === "error" && (
        <div className="k-generating">
          <p className="k-error-text">{errorMsg}</p>
          <button type="button" className="k-primary-btn" onClick={runGenerate}>
            <RefreshCw size={15} /> もう一度試す
          </button>
        </div>
      )}

      {phase === "result" && (
        <ResultScreen
          config={config}
          reviewText={reviewText}
          setReviewText={setReviewText}
          responseId={responseId}
          onRegenerate={runGenerate}
          regenerating={false}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ルート                                                             */
/* ------------------------------------------------------------------ */

export { CustomerSurvey };
