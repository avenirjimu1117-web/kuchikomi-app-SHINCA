import { apiPost } from "./api";

// アンケート回答を「質問文 + 回答テキスト」の形に変換する。
// 複数選択はselectedLabelsも持たせておき、GAS側で回答明細シートに1選択肢=1行で記録できるようにする。
export function buildQaPairs(config, answers) {
  return config.surveySteps
    .flatMap((s) => s.questions)
    .map((q) => {
      const a = answers[q.id];

      if (q.type === "multi") {
        const labels =
          a && a.length
            ? a.map((optId) => q.options.find((o) => o.id === optId)?.label).filter(Boolean)
            : [];
        return {
          questionId: q.id,
          questionLabel: q.label,
          type: q.type,
          answerText: labels.length ? labels.join("、") : "(未回答)",
          selectedLabels: labels,
        };
      }

      if (q.type === "single") {
        const label = a ? q.options.find((o) => o.id === a)?.label || "" : "";
        return { questionId: q.id, questionLabel: q.label, type: q.type, answerText: label || "(未回答)" };
      }

      const text = a && typeof a === "string" ? a.trim() : "";
      return { questionId: q.id, questionLabel: q.label, type: q.type, answerText: text || "(未回答)" };
    });
}

// GAS側のgenerateReviewアクションを呼ぶ。
// 文章生成・回答ログ記録・回答明細記録はすべてバックエンド(GAS)側で行われる。
export async function generateReviewText(config, answers) {
  const qaPairs = buildQaPairs(config, answers);
  const data = await apiPost("generateReview", {
    storeId: config.storeId,
    qaPairs,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  });
  return data; // { responseId, reviewText }
}

export async function logCopyAction(responseId) {
  if (!responseId) return;
  try {
    await apiPost("logCopyAction", { responseId });
  } catch (e) {
    // コピー計測の失敗はユーザー体験をブロックしない
  }
}
