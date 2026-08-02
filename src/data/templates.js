// 業種別アンケートテンプレート & 共通トークン
// (口コミ生成アーティファクト試作版から移植)

const TOKENS = {
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceSoft: "#F5F5F3",
  text: "#1C1C1A",
  textMuted: "#8C8C86",
  border: "#E2E2DE",
  primary: "#1C1C1A",
  primaryDark: "#000000",
  primarySoft: "#ECECE8",
  gold: "#4A4A45",
  goldSoft: "#F0EFEA",
  danger: "#3A3A36",
};

let idSeed = 0;
const uid = (prefix) => {
  idSeed += 1;
  return `${prefix}_${Date.now().toString(36)}_${idSeed}`;
};

const HAIR_STEPS = [
  {
    id: "h_step_1",
    title: "ご来店について",
    questions: [
      {
        id: "h_q_visit",
        type: "single",
        label: "ご来店は何回目ですか?",
        required: true,
        options: [
          { id: "o1", label: "初めて" },
          { id: "o2", label: "2回目以上" },
        ],
      },
      {
        id: "h_q_reason",
        type: "multi",
        label: "ご来店のきっかけを教えてください",
        required: false,
        maxSelect: 3,
        options: [
          { id: "o1", label: "Googleマップを見て" },
          { id: "o2", label: "InstagramなどのSNSを見て" },
          { id: "o3", label: "ホットペッパービューティーを見て" },
          { id: "o4", label: "知人の紹介" },
          { id: "o5", label: "公式ホームページを見て" },
        ],
      },
    ],
  },
  {
    id: "h_step_2",
    title: "スタッフの対応・仕上がり",
    questions: [
      {
        id: "h_q_staff",
        type: "multi",
        label: "スタッフの対応はいかがでしたか?",
        required: true,
        maxSelect: 5,
        options: [
          { id: "o1", label: "カウンセリングが丁寧だった" },
          { id: "o2", label: "悩みをしっかり聞いてくれた" },
          { id: "o3", label: "施術がスムーズで安心できた" },
          { id: "o4", label: "接客が丁寧だった" },
          { id: "o5", label: "説明がわかりやすかった" },
        ],
      },
      {
        id: "h_q_finish",
        type: "multi",
        label: "仕上がりについてどう感じましたか?",
        required: true,
        maxSelect: 5,
        options: [
          { id: "o1", label: "理想通りだった" },
          { id: "o2", label: "期待以上だった" },
          { id: "o3", label: "長持ちしそうだった" },
          { id: "o4", label: "ふつう" },
          { id: "o5", label: "改善してほしい点があった" },
        ],
      },
    ],
  },
  {
    id: "h_step_3",
    title: "総合的なご感想",
    questions: [
      {
        id: "h_q_overall",
        type: "single",
        label: "総合的な満足度を教えてください",
        required: true,
        options: [
          { id: "o1", label: "とても満足" },
          { id: "o2", label: "満足" },
          { id: "o3", label: "普通" },
        ],
      },
      {
        id: "h_q_free",
        type: "text",
        label: "体験した内容や感想を自由に記入してください(任意)",
        required: false,
      },
    ],
  },
];

const NAIL_STEPS = [
  {
    id: "n_step_1",
    title: "ご来店について",
    questions: [
      {
        id: "n_q_visit",
        type: "single",
        label: "ご来店は何回目ですか?",
        required: true,
        options: [
          { id: "o1", label: "初めて" },
          { id: "o2", label: "2回目以上" },
        ],
      },
      {
        id: "n_q_reason",
        type: "multi",
        label: "ご来店のきっかけを教えてください",
        required: false,
        maxSelect: 3,
        options: [
          { id: "o1", label: "Googleマップを見て" },
          { id: "o2", label: "InstagramなどのSNSを見て" },
          { id: "o3", label: "ホットペッパービューティーを見て" },
          { id: "o4", label: "知人の紹介" },
          { id: "o5", label: "公式ホームページを見て" },
        ],
      },
    ],
  },
  {
    id: "n_step_2",
    title: "デザイン・仕上がりについて",
    questions: [
      {
        id: "n_q_design",
        type: "multi",
        label: "デザイン・仕上がりについて当てはまるものを教えてください",
        required: true,
        maxSelect: 5,
        options: [
          { id: "o1", label: "希望通りのデザインだった" },
          { id: "o2", label: "カラーの発色がきれいだった" },
          { id: "o3", label: "持ちが良さそうだった" },
          { id: "o4", label: "施術が丁寧だった" },
          { id: "o5", label: "仕上がりが早かった" },
        ],
      },
      {
        id: "n_q_staff",
        type: "multi",
        label: "スタッフの対応はいかがでしたか?",
        required: true,
        maxSelect: 5,
        options: [
          { id: "o1", label: "カウンセリングが丁寧だった" },
          { id: "o2", label: "要望をしっかり聞いてくれた" },
          { id: "o3", label: "接客が丁寧だった" },
          { id: "o4", label: "説明がわかりやすかった" },
          { id: "o5", label: "店内が清潔で快適だった" },
        ],
      },
    ],
  },
  {
    id: "n_step_3",
    title: "総合的なご感想",
    questions: [
      {
        id: "n_q_overall",
        type: "single",
        label: "総合的な満足度を教えてください",
        required: true,
        options: [
          { id: "o1", label: "とても満足" },
          { id: "o2", label: "満足" },
          { id: "o3", label: "普通" },
        ],
      },
      {
        id: "n_q_free",
        type: "text",
        label: "体験した内容や感想を自由に記入してください(任意)",
        required: false,
      },
    ],
  },
];

const EYELASH_STEPS = [
  {
    id: "e_step_1",
    title: "ご来店について",
    questions: [
      {
        id: "e_q_visit",
        type: "single",
        label: "ご来店は何回目ですか?",
        required: true,
        options: [
          { id: "o1", label: "初めて" },
          { id: "o2", label: "2回目以上" },
        ],
      },
      {
        id: "e_q_reason",
        type: "multi",
        label: "ご来店のきっかけを教えてください",
        required: false,
        maxSelect: 3,
        options: [
          { id: "o1", label: "Googleマップを見て" },
          { id: "o2", label: "InstagramなどのSNSを見て" },
          { id: "o3", label: "ホットペッパービューティーを見て" },
          { id: "o4", label: "知人の紹介" },
          { id: "o5", label: "公式ホームページを見て" },
        ],
      },
    ],
  },
  {
    id: "e_step_2",
    title: "施術について",
    questions: [
      {
        id: "e_q_finish",
        type: "multi",
        label: "施術について当てはまるものを教えてください",
        required: true,
        maxSelect: 5,
        options: [
          { id: "o1", label: "まつ毛の仕上がりが理想通りだった" },
          { id: "o2", label: "眉のデザインが似合っていた" },
          { id: "o3", label: "施術中の痛みが少なかった" },
          { id: "o4", label: "持ちが良さそうだった" },
          { id: "o5", label: "カウンセリングが丁寧だった" },
        ],
      },
      {
        id: "e_q_staff",
        type: "multi",
        label: "スタッフの対応はいかがでしたか?",
        required: true,
        maxSelect: 5,
        options: [
          { id: "o1", label: "丁寧な接客だった" },
          { id: "o2", label: "要望をしっかり聞いてくれた" },
          { id: "o3", label: "店内が清潔で落ち着いていた" },
          { id: "o4", label: "説明がわかりやすかった" },
        ],
      },
    ],
  },
  {
    id: "e_step_3",
    title: "総合的なご感想",
    questions: [
      {
        id: "e_q_overall",
        type: "single",
        label: "総合的な満足度を教えてください",
        required: true,
        options: [
          { id: "o1", label: "とても満足" },
          { id: "o2", label: "満足" },
          { id: "o3", label: "普通" },
        ],
      },
      {
        id: "e_q_free",
        type: "text",
        label: "体験した内容や感想を自由に記入してください(任意)",
        required: false,
      },
    ],
  },
];

const NAIL_EYELASH_STEPS = [
  {
    id: "ne_step_1",
    title: "ご来店について",
    questions: [
      {
        id: "ne_q_visit",
        type: "single",
        label: "ご来店は何回目ですか?",
        required: true,
        options: [
          { id: "o1", label: "初めて" },
          { id: "o2", label: "2回目以上" },
        ],
      },
      {
        id: "ne_q_reason",
        type: "multi",
        label: "ご来店のきっかけを教えてください",
        required: false,
        maxSelect: 3,
        options: [
          { id: "o1", label: "Googleマップを見て" },
          { id: "o2", label: "InstagramなどのSNSを見て" },
          { id: "o3", label: "ホットペッパービューティーを見て" },
          { id: "o4", label: "知人の紹介" },
          { id: "o5", label: "公式ホームページを見て" },
        ],
      },
    ],
  },
  {
    id: "ne_step_2",
    title: "受けた施術・仕上がりについて",
    questions: [
      {
        id: "ne_q_menu",
        type: "multi",
        label: "本日受けた施術を教えてください",
        required: true,
        maxSelect: 4,
        options: [
          { id: "o1", label: "ネイル" },
          { id: "o2", label: "まつ毛エクステ・パーマ" },
          { id: "o3", label: "眉ワックス・デザイン" },
          { id: "o4", label: "ジェルオフのみ" },
          { id: "o5", label: "その他" },
        ],
      },
      {
        id: "ne_q_finish",
        type: "multi",
        label: "施術について当てはまるものを教えてください",
        required: true,
        maxSelect: 5,
        options: [
          { id: "o1", label: "デザインが理想通りだった" },
          { id: "o2", label: "カラーの発色や仕上がりがきれいだった" },
          { id: "o3", label: "まつ毛・眉の仕上がりが自然だった" },
          { id: "o4", label: "施術中の痛みが少なかった" },
          { id: "o5", label: "持ちが良さそうだった" },
        ],
      },
      {
        id: "ne_q_staff",
        type: "multi",
        label: "スタッフの対応はいかがでしたか?",
        required: true,
        maxSelect: 5,
        options: [
          { id: "o1", label: "カウンセリングが丁寧だった" },
          { id: "o2", label: "要望をしっかり聞いてくれた" },
          { id: "o3", label: "接客が丁寧だった" },
          { id: "o4", label: "説明がわかりやすかった" },
          { id: "o5", label: "店内が清潔で快適だった" },
        ],
      },
    ],
  },
  {
    id: "ne_step_3",
    title: "総合的なご感想",
    questions: [
      {
        id: "ne_q_overall",
        type: "single",
        label: "総合的な満足度を教えてください",
        required: true,
        options: [
          { id: "o1", label: "とても満足" },
          { id: "o2", label: "満足" },
          { id: "o3", label: "普通" },
        ],
      },
      {
        id: "ne_q_free",
        type: "text",
        label: "体験した内容や感想を自由に記入してください(任意)",
        required: false,
      },
    ],
  },
];

const BRAND_TYPES = [
  { id: "hair", label: "ヘア", steps: HAIR_STEPS },
  { id: "nail", label: "ネイル", steps: NAIL_STEPS },
  { id: "eyelash", label: "アイラッシュ・眉", steps: EYELASH_STEPS },
  { id: "nail_eyelash", label: "ネイル・アイラッシュ複合", steps: NAIL_EYELASH_STEPS },
];

const cloneSteps = (steps) => JSON.parse(JSON.stringify(steps));

function makeConfig({ name, tagline, brandType }) {
  const type = BRAND_TYPES.find((b) => b.id === brandType) || BRAND_TYPES[0];
  return {
    shopName: name,
    tagline: tagline || "",
    googleReviewUrl: "",
    design: {
      primaryColor: TOKENS.primary,
      accentColor: TOKENS.gold,
    },
    aiSettings: {
      minLength: 150,
      maxLength: 300,
      keywords: [],
    },
    surveySteps: cloneSteps(type.steps),
  };
}

const DEFAULT_STORES = [
  { id: "store_arbre", name: "Arbre et chimie", brandType: "hair", tagline: "髪と、暮らしと、あなたと。" },
  { id: "store_choupinet", name: "Choupinet by Arbre et chimie", brandType: "hair", tagline: "親子で楽しむ、やさしい時間。" },
  { id: "store_miroir", name: "Miroir EYELASH&BROW", brandType: "eyelash", tagline: "目もとから、印象を変える。" },
  { id: "store_liora", name: "Liora nail&eye", brandType: "nail_eyelash", tagline: "指先から、なりたい私へ。" },
];

export { TOKENS, uid, HAIR_STEPS, NAIL_STEPS, EYELASH_STEPS, NAIL_EYELASH_STEPS, BRAND_TYPES, cloneSteps, makeConfig, DEFAULT_STORES };
