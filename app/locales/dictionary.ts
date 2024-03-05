const en:{[key:string]: any} = {
    character: 'Character: ',
	model: 'Model: ',
	user: 'User: ',
	ai: 'AI: ',
	system: 'System: ',
	acceptsBroadCast: 'Accepts Broadcast',
	childInputPlaceholder: 'Say something to this model...',
	parentInputPlaceholder: "Say something to all models...",
	imageUrlPlaceholder: 'Image URL (PNG, JPEG, WEBP, and non-animated GIF). Only works for a few models.',

	defaultModelsLabel: 'Default',
	magiModelsLabel: 'MAGI',
	optpessModelsLabel: 'Optim/Pessi',
	gptModelsLabel: 'OpenAI GPT',
	googleModelsLabel: 'Google',
	anthropicModelsLabel: 'Anthropic',
	describeImageModelsLabel: 'Describe Image',
	generateImageModelsLabel: 'Generate Image',
	randomModelsLabel: 'Random',
} as const

const ja:{[key:string]: any} = {
    character: '性格: ',
	model: 'モデル: ',
	user: 'ユーザー: ',
	ai: 'AI: ',
	system: 'システム: ',
	acceptsBroadCast: '全体送信を利用する',
	childInputPlaceholder: 'このモデルに送信...',
	parentInputPlaceholder: "全体に送信...",
	imageUrlPlaceholder: '画像URL（PNG、JPEG、WEBP、非アニメーションGIF)。一部モデルでのみ動作します。',

	defaultModelsLabel: 'おすすめ',
	magiModelsLabel: 'MAGI',
	optpessModelsLabel: '楽観悲観',
	gptModelsLabel: 'OpenAI GPT',
	googleModelsLabel: 'Google',
	anthropicModelsLabel: 'Anthropic',
	describeImageModelsLabel: '画像説明',
	generateImageModelsLabel: '画像生成',
	randomModelsLabel: 'ランダム',
} as const

export const dictionary:{[lang:string]:{[key:string]:any}} = {en, ja}
