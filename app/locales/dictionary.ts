const en:{[key:string]: any} = {
    character: 'Character: ',
	model: 'Model: ',
	user: 'User: ',
	ai: 'AI: ',
	system: 'System: ',
	acceptsBroadCast: 'Accepts Broadcast',
	childInputPlaceholder: 'Say something to this model...',
	parentInputPlaceholder: "Say something to all models...",
} as const

const ja:{[key:string]: any} = {
    character: 'キャラクター: ',
	model: 'モデル: ',
	user: 'ユーザー: ',
	ai: 'AI: ',
	system: 'システム: ',
	acceptsBroadCast: '全体送信を利用する',
	childInputPlaceholder: 'このモデルに送信...',
	parentInputPlaceholder: "全体に送信...",
} as const

export const dictionary:{[lang:string]:{[key:string]:any}} = {en, ja}
