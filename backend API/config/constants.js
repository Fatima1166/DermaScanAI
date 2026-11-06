const SKIN_RELATED_KEYWORDS = [
  'skin', 'face', 'cream', 'lotion', 'serum', 'moisturizer', 'cleanser',
  'toner', 'sunscreen', 'spf', 'acne', 'anti-aging', 'retinol', 'vitamin c',
  'hyaluronic', 'niacinamide', 'peptide', 'ceramide', 'exfoliant', 'mask',
  'eye cream', 'lip balm', 'body lotion', 'hand cream', 'foot cream',
  'acids', 'aha', 'bha', 'glycolic', 'salicylic', 'lactic', 'mandelic',
  'azelaic', 'kojic', 'tranexamic', 'alpha arbutin', 'bakuchiol',
  'squalane', 'glycerin', 'dimethicone', 'petrolatum', 'lanolin',
  'mineral oil', 'paraffin', 'beeswax', 'carnauba wax', 'cetyl alcohol',
  'stearyl alcohol', 'cetearyl alcohol', 'emollient', 'humectant',
  'occlusive', 'surfactant', 'preservative', 'fragrance', 'parfum',
  'essential oil', 'botanical', 'extract', 'ferment', 'probiotic',
  'prebiotic', 'postbiotic', 'collagen', 'elastin', 'keratin',
  'dermatologist', 'hypoallergenic', 'non-comedogenic', 'oil-free',
  'water-based', 'gel-based', 'cream-based', 'ointment', 'balm',
  'medicine', 'ointment', 'topical', 'dermatology'
];

const AVAILABLE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash'
];

// Alibaba Cloud Qwen (Tongyi Qianwen) models via OpenRouter
const QWEN_MODELS = [
  'qwen/qwen-plus',
  'qwen/qwen-turbo',
  'qwen/qwen-max'
];

// OpenRouter OpenAI-compatible endpoint
const QWEN_BASE_URL = 'https://openrouter.ai/api/v1';

module.exports = {
  SKIN_RELATED_KEYWORDS,
  AVAILABLE_MODELS,
  QWEN_MODELS,
  QWEN_BASE_URL
};